import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { BatchServiceService } from 'src/app/components/shared/Services/batch-service.service';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatTableDataSource } from '@angular/material/table';
import { CourseTableDataService } from 'src/app/components/shared/Services/course-table-data.service';
import { AttendanceService } from '../../../shared/Services/attendance.service';
import { forkJoin, map, Observable } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Course {
  courseId: number;
  courseName: string;
  topics: Topic[];
}

interface Topic {
  topicId: number;
  topicName: string;
}

interface AttendanceRecord {
  course: { courseId: number };
  topic: { topicId: number };
  topicPercentageCompleted: number;
}

interface CourseProgress {
  courseName: string;
  topicsCompletedNames: string[];
  topicsInProgress: string[];
  courseCompletionPercentage: string;
}

interface TopicDTO {
  topicId: number;
  topicName: string;
  topicOrder: number;
  theoryTime: number;
  practiceTime: number;
}

interface CourseWithTopics {
  courseId: number;
  courseName: string;
  code: string;
  description: string;
  theoryTime: number;
  practiceTime: number;
  topics: TopicDTO[];
}

@Component({
  selector: 'app-batches-and-programs',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    MatTooltipModule,
  ],
  templateUrl: './batches-and-programs.component.html',
  styleUrls: ['./batches-and-programs.component.scss'],
})
export class BatchesAndProgramsComponent implements OnInit {
  batches: any[] = [];
  programs: any[] = [];

  courses: any[] = [];
  attendanceRecords: any[] = [];

  courseProgressData$!: Observable<CourseProgress[]>;

  teacherId!: number;
  teacherName!: string;

  selectedBatchId: number = -1;

  batchProgramReactiveForm!: FormGroup;

  showTableBasedOnFilter: boolean = false;

  filterPayload: any = {};

  displayedColumns: string[] = [
    'courseName',
    'topicsCompletedNames',
    'topicsInProgress',
    'courseCompletionPercentage',
  ];
  dataSource!: MatTableDataSource<any>;

  constructor(
    private batchService: BatchServiceService,
    private courseService: CourseTableDataService,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit(): void {
    this.getTeacherDetails();
    this.getBatches();
    this.batchProgramReactiveForm = new FormGroup({
      batch: new FormControl(null, Validators.required),
      batchStartDate: new FormControl(
        { value: null, disabled: true },
        Validators.required
      ),
      program: new FormControl(
        { value: null, disabled: true },
        Validators.required
      ),
    });

    this.batchProgramReactiveForm.get('batch')?.valueChanges.subscribe(() => {
      this.onBatchChange();
    });

    this.batchProgramReactiveForm.get('program')?.valueChanges.subscribe(() => {
      this.onProgramChange();
    });
  }

  getBatches() {
    this.batchService.getBatchDetailsByTeacherId(this.teacherId).subscribe({
      next: (data) => {
        const uniqueBatchIds = new Set();
        for (const obj of data) {
          if (!uniqueBatchIds.has(obj.batchId)) {
            uniqueBatchIds.add(obj.batchId);
            const batchPayload = {
              batchId: obj.batchId,
              batchCode: obj.batchCode,
              batchName: obj.batchName,
              batchStartDate: obj.batchStartDate,
            };
            this.batches.push(batchPayload);
          }
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  onBatchChange() {
    this.batchProgramReactiveForm.get('program')?.reset();
    const selectedBatchId = this.batchProgramReactiveForm.get('batch')?.value;
    const selectedBatch = this.batches.find(
      (batch) => batch.batchId === selectedBatchId
    );
    if (selectedBatch) {
      this.batchProgramReactiveForm
        .get('batchStartDate')
        ?.setValue(selectedBatch.batchStartDate);
      this.batchProgramReactiveForm.get('program')?.enable();
      this.selectedBatchId = selectedBatchId;
      this.getBatchPrograms(selectedBatchId);
    } else {
      this.batchProgramReactiveForm.get('batchStartDate')?.setValue(null);
      this.batchProgramReactiveForm.get('program')?.disable();
    }
  }

  getBatchPrograms(batchId: number) {
    this.batchService.getBatchDetailsByTeacherId(this.teacherId).subscribe({
      next: (data) => {
        this.programs.length = 0; // Clear previous programs
        const uniqueProgramIds = new Set();
        for (const obj of data) {
          if (obj.batchId === batchId && !uniqueProgramIds.has(obj.programId)) {
            uniqueProgramIds.add(obj.programId);
            const programPayload = {
              programId: obj.programId,
              programName: obj.programName,
              programCode: obj.programCode,
            };
            this.programs.push(programPayload);
          }
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  onProgramChange() {
    const programId = this.batchProgramReactiveForm.get('program')?.value;
    this.filterPayload = {
      teacherId: this.teacherId,
      batchId: this.selectedBatchId,
      programId: programId,
    };
    this.showTableBasedOnFilter = false;
    this.loadData();
  }

  processCourseData(
    courses: CourseWithTopics[],
    attendanceRecords: AttendanceRecord[]
  ): CourseProgress[] {
    return courses.map((course: CourseWithTopics) => {
      const courseTopics = course.topics || [];
      const courseAttendance = attendanceRecords.filter(
        (a: AttendanceRecord) => a.course.courseId === course.courseId
      );

      const topicsCompletedNames = courseTopics
        .filter((topic: TopicDTO) =>
          courseAttendance.some(
            (a: AttendanceRecord) =>
              a.topic.topicId === topic.topicId &&
              a.topicPercentageCompleted === 100
          )
        )
        .map((topic: TopicDTO) => topic.topicName);

      const topicsInProgress = courseTopics
        .filter((topic: TopicDTO) =>
          courseAttendance.some(
            (a: AttendanceRecord) =>
              a.topic.topicId === topic.topicId &&
              a.topicPercentageCompleted > 0 &&
              a.topicPercentageCompleted < 100
          )
        )
        .map((topic: TopicDTO) => topic.topicName);

      const courseCompletionPercentage =
        courseTopics.length > 0
          ? (
              courseTopics.reduce((sum: number, topic: TopicDTO) => {
                const topicAttendance = courseAttendance.find(
                  (a: AttendanceRecord) => a.topic.topicId === topic.topicId
                );
                return (
                  sum +
                  (topicAttendance
                    ? topicAttendance.topicPercentageCompleted
                    : 0)
                );
              }, 0) / courseTopics.length
            ).toFixed(2) + '%'
          : '0.00%';

      return {
        courseName: course.courseName,
        topicsCompletedNames:
          topicsCompletedNames.length > 0 ? topicsCompletedNames : ['None'],
        topicsInProgress:
          topicsInProgress.length > 0 ? topicsInProgress : ['None'],
        courseCompletionPercentage,
      };
    });
  }

  loadData() {
    const courses$ = this.courseService.getCoursesByBatchIdProgramIdTeacherId(
      this.filterPayload
    );
    const attendance$ = this.attendanceService.getByBatchProgramTeacher(
      this.filterPayload
    );

    this.courseProgressData$ = forkJoin([courses$, attendance$]).pipe(
      map(([coursesResponse, attendanceResponse]) => {
        const courses = coursesResponse.data;
        const attendanceRecords = attendanceResponse.data;
        return this.processCourseData(courses, attendanceRecords);
      })
    );

    this.courseProgressData$.subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.showTableBasedOnFilter = true;
      },
      error: (error) => {
        // this.dataSource = new MatTableDataSource([]);
        console.error('Error loading data:', error);
      },
    });
  }

  getTeacherDetails() {
    const storedTeacherDetails = localStorage.getItem('teacherDetails');
    if (storedTeacherDetails) {
      const teacherDetails = JSON.parse(storedTeacherDetails);
      this.teacherId = teacherDetails.teacherId;
      this.teacherName = teacherDetails.username;
    } else {
      console.log('No teacher details found in localStorage');
    }
  }
}
