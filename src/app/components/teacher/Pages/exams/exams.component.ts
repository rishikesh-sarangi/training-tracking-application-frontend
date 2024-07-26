import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
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
  @ViewChild(ExamsTableComponent) examsTableComponent!: ExamsTableComponent;

  onExamAdded() {
    if (this.examsTableComponent) {
      this.examsTableComponent.getSharedDetails();
    }
  }

  onFileUploaded(updatedRow: any) {
    if (this.examsTableComponent) {
      this.examsTableComponent.getSharedDetails();
      this.examsTableComponent.updateTableRow(updatedRow);
    }
  }

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

  openTableBasedOnFilter() {
    // dont know what this does
    this.showTableBasedOnFilter = false;
    setTimeout(() => {
      this.filterPayload = {
        teacherId: this.teacherId,
        batchId: this.selectedBatchId,
        programId: this.examReactiveForm.value.program,
        courseId: this.examReactiveForm.value.course,
      };
      this.showTableBasedOnFilter = true;
      this.createExam = true;
    }, 0);
  }

  onBatchChange(event: any) {
    this.programs.length = 0;
    this.courses.length = 0;
    this.examReactiveForm.get('program')?.reset();
    this.examReactiveForm.get('course')?.reset();
    for (const obj of this.batches) {
      if (obj.batchId === event.value) {
        const batchStartDate = obj.batchStartDate;
        this.examReactiveForm?.get('program')?.enable();
        this.getBatchPrograms(obj.batchId);

        this.examReactiveForm.get('batchStartDate')?.setValue(batchStartDate);

        return;
      }
    }
    this.showTableBasedOnFilter = false;
  }

  onProgramChange(event: any) {
    this.courses.length = 0;
    this.examReactiveForm.get('course')?.reset();
    for (const obj of this.programs) {
      if (obj.programId === event.value) {
        this.examReactiveForm?.get('course')?.enable();
        this.getCourses(obj.programId, this.selectedBatchId);
        return;
      }
    }
    this.showTableBasedOnFilter = false;
  }

  onCourseChange(event: any) {
    if (this.examReactiveForm.valid) {
      this.openTableBasedOnFilter();
    } else {
      this.showTableBasedOnFilter = false;
    }
  }

  // controlled by child component
  closeForm() {
    if (this.createExam == false) {
      this.createExam = true;
      this.openExamForm = false;

      this.examReactiveForm.reset();
      this.examReactiveForm.enable();
      this.examReactiveForm?.get('batchStartDate')?.disable();
    }
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
    if (this.createExam == true) {
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
