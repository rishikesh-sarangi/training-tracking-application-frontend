import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { BatchServiceService } from 'src/app/components/shared/Services/batch-service.service';
import { BatchProgramsService } from 'src/app/components/shared/Services/batch-programs.service';
import { AttendanceTableComponent } from './attendance-table/attendance-table.component';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  NgForm,
} from '@angular/forms';
@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    AttendanceTableComponent,
  ],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss'],
})
export class AttendanceComponent {
  batches: any[] = [];
  programs: any[] = [];
  courses: any[] = [];

  batchProgramReactiveForm!: FormGroup;

  // allows the opening of the table below
  enableTable: boolean = false;
  constructor(
    private batchService: BatchServiceService,
    private batchProgramService: BatchProgramsService
  ) {}

  ngOnInit(): void {
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

  getBatches() {
    this.batchService.getBatches().subscribe({
      next: (data) => {
        for (const obj of data) {
          this.batches.push(obj);

          // console.log(obj);
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  getBatchProgram(batchCode: string) {
    this.batchProgramService.getBatchProgramByBatchCode(batchCode).subscribe({
      next: (data) => {
        // this.programs = data;
        for (const obj of data) {
          // console.log(obj);
          this.programs.length = 0;
          for (const batchProgram of obj.batchPrograms) {
            this.programs.push(batchProgram);
            // console.log(this.programs);
          }
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  onBatchChange(event: any) {
    for (const obj of this.batches) {
      if (obj.batchCode === event.value) {
        const batchStartDate = obj.batchStartDate;
        this.batchProgramReactiveForm?.get('program')?.enable();
        this.getBatchProgram(obj.batchCode);
        this.batchProgramReactiveForm
          .get('batchStartDate')
          ?.setValue(batchStartDate);
        return;
      }
    }
  }

  onProgramChange() {
    this.courses = ['Course 1', 'Course 2', 'Course 3'];
    this.batchProgramReactiveForm?.get('course')?.enable();
  }

  onCourseChange() {
    this.batchProgramReactiveForm?.get('date')?.enable();
  }
  enableAddTopic: boolean = false;
  attendancePayload!: any[];
  onDateChange() {
    this.enableAddTopic = true;
  }

  sendPayloadToChild() {
    if (this.batchProgramReactiveForm.valid) {
      this.attendancePayload = this.batchProgramReactiveForm.value;
      this.enableTable = true;
    }
    // console.log(this.attendancePayload);
    // console.log(this.enableTable);
  }
}
