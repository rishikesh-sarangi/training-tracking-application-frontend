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

  @Input() isAssignments: boolean = false;

  constructor(
    private batchService: BatchServiceService,
    private batchProgramService: BatchProgramsService,
    private courseService: CourseTableDataService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isAssignments']) {
      this.isAssignments = changes['isAssignments'].currentValue;
    }
  }

  ngOnInit(): void {
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
    this.batchService.getBatches().subscribe({
      next: (data) => {
        // console.log(data);
        for (const obj of data) {
          this.batches.push(obj);
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  getBatchPrograms(batchCode: string) {
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

  getCourses() {
    this.courseService.getCourses().subscribe({
      next: (data) => {
        // console.log(data);
        for (const obj of data) {
          this.courses.push(obj);
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
        this.examReactiveForm?.get('program')?.enable();
        this.getBatchPrograms(obj.batchCode);

        this.examReactiveForm.get('batchStartDate')?.setValue(batchStartDate);

        return;
      }
    }
  }

  onProgramChange() {
    this.courses.length = 0;
    this.getCourses();
    this.examReactiveForm?.get('course')?.enable();
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
        ...this.examReactiveForm.value,
      };
      this.openExamForm = !this.openExamForm;
      this.examReactiveForm.disable();
      this.createExam = false;
    }
  }
}
