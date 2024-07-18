import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  NgForm,
} from '@angular/forms';
import { BatchServiceService } from 'src/app/components/shared/Services/batch-service.service';
import { BatchProgramsService } from 'src/app/components/shared/Services/batch-programs.service';
import { CourseTableDataService } from 'src/app/components/shared/Services/course-table-data.service';

import { ExamsAddComponent } from './exams-add/exams-add.component';
import { ExamsTableComponent } from './exams-table/exams-table.component';
@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    ExamsAddComponent,
    ExamsTableComponent,
  ],
  templateUrl: './exams.component.html',
  styleUrls: ['./exams.component.scss'],
})
export class ExamsComponent implements OnInit, OnChanges {
  examReactiveForm!: FormGroup;
  batches: any[] = [];
  programs: any[] = [];
  courses: any[] = [];
  createExam: boolean = false;
  openExamForm: boolean = false;
  teacherId: number = -1;
  teacherName: string = '';
  showTableBasedOnFilter: boolean = false;
  filterPayload: any = {};
  selectedBatchId: number = -1;

  @Input() isAssignments: boolean = false;

  constructor(private batchService: BatchServiceService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isAssignments']) {
      this.isAssignments = changes['isAssignments'].currentValue;
    }
  }

  ngOnInit(): void {
    this.getTeacherDetails();
    this.getBatches();
    this.examReactiveForm = new FormGroup({
      batch: new FormControl(null, Validators.required),

      batchStartDate: new FormControl(
        { value: null, disabled: true },
        Validators.required
      ),

      program: new FormControl(
        { value: null, disabled: true },
        Validators.required
      ),

      course: new FormControl(
        { value: null, disabled: true },
        Validators.required
      ),
    });
  }

  getBatches() {
    this.batchService.getBatchDetailsByTeacherId(this.teacherId).subscribe({
      next: (data) => {
        // console.log(data);
        for (const obj of data) {
          const batchPayload = {
            batchId: obj.batchId,
            batchCode: obj.batchCode,
            batchName: obj.batchName,
            batchStartDate: obj.batchStartDate,
          };
          this.batches.push(batchPayload);
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  getBatchPrograms(batchId: number) {
    this.batchService.getBatchDetailsByTeacherId(this.teacherId).subscribe({
      next: (data) => {
        // this.programs = data;
        this.selectedBatchId = batchId;
        for (const obj of data) {
          if (obj.batchId === batchId) {
            const programPayload = {
              programId: obj.programId,
              programName: obj.programName,
              programCode: obj.programCode,
            };
            this.programs.push(programPayload);
          }
        }
        // console.log(this.programs);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  getCourses(programId: number, selectedBatchId: number) {
    this.batchService.getBatchDetailsByTeacherId(this.teacherId).subscribe({
      next: (data) => {
        // console.log(data);
        for (const obj of data) {
          if (obj.programId === programId && obj.batchId === selectedBatchId) {
            const coursePayload = {
              courseId: obj.courseId,
              courseName: obj.courseName,
              courseCode: obj.courseCode,
            };
            // console.log(coursePayload);
            this.courses.push(coursePayload);
          }
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  openTableBasedOnFilter() {
    if (this.showTableBasedOnFilter) {
      this.showTableBasedOnFilter = false;
    } else {
      this.showTableBasedOnFilter = true;

      this.filterPayload = {
        teacherId: this.teacherId,
        batchId: this.selectedBatchId,
        programId: this.examReactiveForm.value.program,
        courseId: this.examReactiveForm.value.course,
      };
    }

    if (this.createExam) {
      this.createExam = false;
    } else {
      this.createExam = true;
    }
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
        this.examReactiveForm?.get('program')?.enable();
        this.getBatchPrograms(obj.batchId);

        this.examReactiveForm.get('batchStartDate')?.setValue(batchStartDate);

        return;
      }
    }
  }

  onProgramChange(event: any) {
    this.courses.length = 0;
    for (const obj of this.programs) {
      if (obj.programId === event.value) {
        this.examReactiveForm?.get('course')?.enable();
        this.getCourses(obj.programId, this.selectedBatchId);
        return;
      }
    }
  }

  // controlled by child component
  closeForm() {
    this.createExam = false;
    this.openExamForm = false;
    this.examReactiveForm.reset();
    this.examReactiveForm.enable();
    this.examReactiveForm?.get('batchStartDate')?.disable();
  }

  // this function controlls the child
  parentPayload!: any;
  openForm() {
    if (this.examReactiveForm.valid) {
      this.examReactiveForm?.get('batchStartDate')?.enable();
      this.parentPayload = {
        course: {
          courseId: this.examReactiveForm.value.course,
        },
        program: {
          programId: this.examReactiveForm.value.program,
        },
        batch: {
          batchId: this.examReactiveForm.value.batch,
        },
        teacher: {
          teacherId: this.teacherId,
        },
      };
      this.openExamForm = !this.openExamForm;
      this.examReactiveForm.disable();
      this.createExam = false;
    }
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
