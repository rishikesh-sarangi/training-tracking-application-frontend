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
  topicsCompleted: number;
  topicsInProgress: number;
  courseCompletionPercentage: number;
}
@Component({
  selector: 'app-batches-and-programs',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
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
    'topicsCompleted',
    'topicsInProgress',
    'courseCompletionPercentage',
  ];
  dataSource!: MatTableDataSource<CourseProgress>;

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
    // console.log(this.batches);
  }

  getBatches() {
    this.batchService.getBatchDetailsByTeacherId(this.teacherId).subscribe({
      next: (data) => {
        // to keep unique entries only
        const uniqueBatchIds = new Set();

        for (const obj of data) {
          // check if the batchId is already in the set
          if (!uniqueBatchIds.has(obj.batchId)) {
            uniqueBatchIds.add(obj.batchId);

            // creation of the batch payload
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

  onBatchChange(event: any) {
    this.programs.length = 0;
    // this.showTableBasedOnFilter
    //   ? (this.showTableBasedOnFilter = false)
    //   : (this.showTableBasedOnFilter = true);

    // this.createExam ? (this.createExam = false) : (this.createExam = true);

    for (const obj of this.batches) {
      if (obj.batchId === event.value) {
        const batchStartDate = obj.batchStartDate;
        this.batchProgramReactiveForm?.get('program')?.enable();
        this.getBatchPrograms(obj.batchId);

        this.batchProgramReactiveForm
          .get('batchStartDate')
          ?.setValue(batchStartDate);
        return;
      }
    }
  }

  getBatchPrograms(batchId: number) {
    this.batchService.getBatchDetailsByTeacherId(this.teacherId).subscribe({
      next: (data) => {
        this.selectedBatchId = batchId;
        // set to track unique programIDs
        const uniqueProgramIds = new Set();

        for (const obj of data) {
          if (obj.batchId === batchId) {
            // check if the programId is already in the set
            if (!uniqueProgramIds.has(obj.programId)) {
              uniqueProgramIds.add(obj.programId);

              // creation of the program payload
              const programPayload = {
                programId: obj.programId,
                programName: obj.programName,
                programCode: obj.programCode,
              };
              this.programs.push(programPayload);
            }
          }
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  openFilterPayload(programId: number) {
    this.filterPayload = {
      teacherId: this.teacherId,
      batchId: this.selectedBatchId,
      programId: programId,
    };

    if (this.showTableBasedOnFilter) {
      this.showTableBasedOnFilter = false;
    } else {
      this.showTableBasedOnFilter = true;
      this.loadData();
    }
  }

  // make it type safe
  processCourseData(
    courses: Course[],
    attendanceRecords: AttendanceRecord[]
  ): CourseProgress[] {
    // console.log('Courses:', courses);
    // console.log('Attendance Records:', attendanceRecords);

    return courses.map((course: Course) => {
      const courseTopics = course.topics || [];
      const courseAttendance = attendanceRecords.filter(
        (a: AttendanceRecord) => a.course.courseId === course.courseId
      );

      const topicsCompleted = courseTopics.filter((topic: Topic) =>
        courseAttendance.some(
          (a: AttendanceRecord) =>
            a.topic.topicId === topic.topicId &&
            a.topicPercentageCompleted === 100
        )
      ).length;

      const topicsInProgress = courseTopics.filter((topic: Topic) =>
        courseAttendance.some(
          (a: AttendanceRecord) =>
            a.topic.topicId === topic.topicId &&
            a.topicPercentageCompleted > 0 &&
            a.topicPercentageCompleted < 100
        )
      ).length;

      const courseCompletionPercentage =
        courseTopics.length > 0
          ? courseTopics.reduce((sum: number, topic: Topic) => {
              const topicAttendance = courseAttendance.find(
                (a: AttendanceRecord) => a.topic.topicId === topic.topicId
              );
              return (
                sum +
                (topicAttendance ? topicAttendance.topicPercentageCompleted : 0)
              );
            }, 0) / courseTopics.length
          : 0;

      const result: CourseProgress = {
        courseName: course.courseName,
        topicsCompleted,
        topicsInProgress,
        courseCompletionPercentage,
      };

      // console.log('Processed Course:', result);
      return result;
    });
  }

  getCourses() {
    this.courseService
      .getCoursesByBatchIdProgramIdTeacherId(this.filterPayload)
      .subscribe({
        next: (response) => {
          // console.log(response[0].data);
          this.courses = response[0].data;
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  getAttendace() {
    this.attendanceService
      .getByBatchProgramTeacher(this.filterPayload)
      .subscribe({
        next: (response) => {
          // console.log(response[0].data);
          this.attendanceRecords = response[0].data;
        },
        error: (error) => {
          console.log(error);
        },
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
        const courses = coursesResponse[0].data;
        const attendanceRecords = attendanceResponse[0].data;
        console.log('Courses:', courses);
        console.log('Attendance Records:', attendanceRecords);
        return this.processCourseData(courses, attendanceRecords);
      })
    );
    // Subscribe to trigger the HTTP requests
    this.courseProgressData$.subscribe({
      next: (data) => {
        // console.log('Processed Course Progress Data:', data);
        this.dataSource = new MatTableDataSource(data);
      },
      error: (error) => console.error('Error loading data:', error),
    });
  }

  getTeacherDetails() {
    const storedTeacherDetails = localStorage.getItem('teacherDetails');
    if (storedTeacherDetails) {
      // Parse the JSON string back into an object
      const teacherDetails = JSON.parse(storedTeacherDetails);

      // access the properties
      this.teacherId = teacherDetails.teacherId;
      this.teacherName = teacherDetails.username;

      // console.log(this.teacherId);
      // console.log(this.teacherName);
    } else {
      console.log('No teacher details found in localStorage');
    }
  }
}
