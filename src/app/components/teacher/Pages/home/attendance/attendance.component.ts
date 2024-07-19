import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { BatchServiceService } from 'src/app/components/shared/Services/batch-service.service';

import { AttendanceTableComponent } from './attendance-table/attendance-table.component';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  NgForm,
} from '@angular/forms';
import { AttendanceAddComponent } from './attendance-add/attendance-add.component';
@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    AttendanceTableComponent,
    AttendanceAddComponent,
  ],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss'],
})
export class AttendanceComponent {
  batches: any[] = [];
  programs: any[] = [];
  courses: any[] = [];

  selectedBatchId: number = -1;

  teacherId: number = -1;
  teacherName: string = '';

  showTableBasedOnFilter: boolean = false;

  filterPayload: any = {};

  batchProgramReactiveForm!: FormGroup;

  // allows the opening of the table below
  openAttendanceForm: boolean = false;
  constructor(private batchService: BatchServiceService) {}

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
      course: new FormControl(
        { value: null, disabled: true },
        Validators.required
      ),
      date: new FormControl(
        { value: null, disabled: true },
        Validators.required
      ),
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
        programId: this.batchProgramReactiveForm.value.program,
        courseId: this.batchProgramReactiveForm.value.course,
        attendanceDate: this.batchProgramReactiveForm.value.date,
      };
    }

    if (this.enableAddTopic) {
      this.enableAddTopic = false;
    } else {
      this.enableAddTopic = true;
    }
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

  onBatchChange(event: any) {
    this.programs.length = 0;
    // console.log('Dasdsa');
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

  onProgramChange(event: any) {
    this.courses.length = 0;
    for (const obj of this.programs) {
      if (obj.programId === event.value) {
        this.batchProgramReactiveForm?.get('course')?.enable();
        this.getCourses(obj.programId, this.selectedBatchId);
        return;
      }
    }
  }

  onCourseChange() {
    this.batchProgramReactiveForm?.get('date')?.enable();
  }
  enableAddTopic: boolean = false;
  parentPayload: any = {};

  openForm() {
    if (this.batchProgramReactiveForm.valid) {
      this.parentPayload = {
        teacherId: this.teacherId,
        batchId: this.batchProgramReactiveForm.value.batch,
        programId: this.batchProgramReactiveForm.value.program,
        courseId: this.batchProgramReactiveForm.value.course,
        attendanceDate: this.batchProgramReactiveForm.value.date,
      };
      this.openAttendanceForm = !this.openAttendanceForm;
      this.batchProgramReactiveForm.disable();
    }
    // console.log(this.parentPayload);
    // console.log(this.enableTable);
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

  closeForm() {
    this.enableAddTopic = false;
    this.openAttendanceForm = false;
    this.batchProgramReactiveForm.reset();
    this.batchProgramReactiveForm.enable();
    this.batchProgramReactiveForm?.get('batchStartDate')?.disable();
  }
}
