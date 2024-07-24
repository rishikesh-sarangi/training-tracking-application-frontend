import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  FormArray,
} from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogueComponent } from 'src/app/components/shared/delete-dialogue/delete-dialogue.component';
import { EvaluationService } from '../../../shared/Services/evaluation.service';
import { noWhitespaceValidator } from 'src/app/components/shared/Validators/NoWhiteSpaceValidator';
import { TimeFormatPipe } from '../../../shared/pipes/TimeFormatPipe';
import { StudentTableService } from 'src/app/components/shared/Services/student-table.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-exams-table',
  standalone: true,
  imports: [TimeFormatPipe, CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './exams-table.component.html',
  styleUrls: ['./exams-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0px' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class ExamsTableComponent implements OnInit {
  private _filterPayload: any;
  @Input() set filterPayload(value: any) {
    if (
      value &&
      JSON.stringify(value) !== JSON.stringify(this._filterPayload)
    ) {
      this._filterPayload = value;
      this.getSharedDetails();
    }
  }
  get filterPayload(): any {
    return this._filterPayload;
  }
  @Input() isAssignments: boolean = false;
  exams: any[] = [];
  assignments: any[] = [];
  isEvaluationAvailable: boolean = true;
  isExamAvailable: boolean = false;
  isAssignmentAvailable: boolean = false;
  constructor(
    private _dialog: MatDialog,
    private evaluationService: EvaluationService,
    private studentService: StudentTableService,
    private snackBar: MatSnackBar
  ) {}

  displayedColumns: string[] = [];
  setUpColumns() {
    if (this.isAssignments) {
      this.displayedColumns = [
        'actions',
        'assignmentName',
        'totalMarks',
        'assignmentDate',
        'assignmentTime',
        'uploadFile',
      ];
    } else {
      this.displayedColumns = [
        'actions',
        'examName',
        'totalMarks',
        'examDate',
        'examTime',
        'uploadFile',
      ];
    }
  }

  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatSort) sort!: MatSort;

  editingRowID: number = -1;

  students: any[] = [];

  sharedReactiveForm!: FormGroup;
  studentMarksForm!: FormGroup;

  ngOnInit(): void {
    this.setUpColumns();
    this.getSharedDetails();

    // console.log(this.filterPayload);

    this.sharedReactiveForm = new FormGroup({
      evaluationName: new FormControl(null, [
        Validators.required,
        noWhitespaceValidator(),
      ]),
      totalMarks: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^[0-9]+$/),
      ]),
      evaluationDate: new FormControl(null, [Validators.required]),
      evaluationTime: new FormControl(null, [Validators.required]),
      uploadFile: new FormControl(null),
    });

    this.studentMarksForm = new FormGroup({
      studentMarks: new FormArray([]),
    });
  }

  getSharedDetails() {
    this.exams = [];
    this.assignments = [];
    this.isEvaluationAvailable = true;
    this.isExamAvailable = false;
    this.isAssignmentAvailable = false;

    if (!this.filterPayload || !this.filterPayload.courseId) {
      this.isEvaluationAvailable = false;
      return;
    }

    this.evaluationService
      .getEvaluationsByFilters(this.filterPayload)
      .subscribe({
        next: (response) => {
          if (response.responseCode == 404) {
            this.snackBar.open(response.responseMessage, 'Close', {
              duration: 3000,
            });
            this.isEvaluationAvailable = false;
            return;
          }

          const filteredData = response.data.filter(
            (obj: any) =>
              (obj.evaluationType == 'exam' && !this.isAssignments) ||
              (obj.evaluationType == 'assignment' && this.isAssignments)
          );

          this.dataSource = new MatTableDataSource(filteredData);
          this.isEvaluationAvailable = filteredData.length > 0;
          this.isExamAvailable = filteredData.some(
            (obj: any) => obj.evaluationType == 'exam'
          );
          this.isAssignmentAvailable = filteredData.some(
            (obj: any) => obj.evaluationType == 'assignment'
          );

          this.dataSource.sort = this.sort;
        },
        error: (err) => {
          console.log(err);
          this.isEvaluationAvailable = false;
        },
      });
  }

  get studentMarksArray() {
    return this.studentMarksForm.get('studentMarks') as FormArray;
  }

  getStudentsByBatchIdAndProgramId(batchId: number, programId: number) {
    this.studentService
      .getStudentsByBatchAndProgram(batchId, programId)
      .subscribe({
        next: (data) => {
          this.students = data;
          this.initStudentMarksControls();
        },
      });
  }

  initStudentMarksControls() {
    this.studentMarksArray.clear();
    this.students.forEach((student) => {
      this.studentMarksArray.push(
        new FormGroup({
          studentId: new FormControl(student.studentId),
          studentName: new FormControl(student.studentName),
          marksSecured: new FormControl(0, [
            Validators.required,
            Validators.min(0),
            Validators.max(this.getTotalMarks()),
          ]),
        })
      );
    });
  }

  getTotalMarks(): number {
    const row = this.expandedRowTable;
    return row ? row.totalMarks : 100; // Default to 100 if not available
  }

  validateInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    const control = (this.studentMarksArray.at(index) as FormGroup).get(
      'marksSecured'
    );

    if (isNaN(value) || value < 0 || value > this.getTotalMarks()) {
      control?.setErrors({ invalidMarks: true });
    } else {
      control?.setErrors(null);
    }
  }

  saveMarks() {
    if (this.studentMarksForm.valid) {
      const result = this.studentMarksArray.value
        .filter(
          (student: { studentId: number; marksSecured: string }) =>
            student.marksSecured !== ''
        )
        .map(
          ({
            studentId,
            marksSecured,
          }: {
            studentId: number;
            marksSecured: string;
          }) => ({
            student: { studentId: studentId },
            marksSecured: parseInt(marksSecured, 10),
            evaluation: { evaluationId: this.expandedRowTable.evaluationId },
          })
        );

      console.log(result);

      this.evaluationService.addEvaluationForStudents(result).subscribe({
        next: (data) => {
          this.getSharedDetails();
          this.toggleTable(null);
        },
        error: (err) => {
          console.log(err);
        },
      });
    } else {
      this.snackBar.open('Please enter marks for all students', 'Close', {
        duration: 3000,
      });
    }
  }

  editSharedData(id: number, row: any) {
    this.editingRowID = id;
    this.sharedReactiveForm.patchValue(row);
  }

  deleteSharedData(row: any) {
    const dialogRef = this._dialog.open(DeleteDialogueComponent, {
      data: {
        targetType: this.isAssignments ? 'assignment' : 'exam',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.evaluationService.deleteEvaluation(row.evaluationId).subscribe({
          next: (data) => {
            this.getSharedDetails();
          },
          error: (err) => {
            console.log(err);
          },
        });
      }
    });
  }

  saveSharedData(row: any) {
    if (this.sharedReactiveForm.valid) {
      // console.log(this.sharedReactiveForm.value);
      this.evaluationService
        .updateEvaluation(row.evaluationId, this.sharedReactiveForm.value)
        .subscribe({
          next: (data) => {
            this.editingRowID = -1;
            this.sharedReactiveForm.reset();
            this.getSharedDetails();
          },
          error: (err) => {
            console.log(err);
          },
        });
    }
  }

  cancelEditing() {
    this.editingRowID = -1;
    this.sharedReactiveForm.reset();
  }

  expandedRowTable: any = null;
  isMarkStudentsClicked: boolean = false;

  toggleTable(row: any) {
    if (this.expandedRowTable === row) {
      // Closing the expanded row
      this.expandedRowTable = null;
      this.isMarkStudentsClicked = false; // Reset the flag when closing
    } else if (row === null) {
      // Explicit close action (e.g., from a close button)
      this.expandedRowTable = null;
      this.isMarkStudentsClicked = false; // Reset the flag when explicitly closing
    } else {
      // Opening a new row
      this.expandedRowTable = row;
      this.isMarkStudentsClicked = true; // Set the flag when opening
      this.getStudentsByBatchIdAndProgramId(
        row.batch.batchId,
        row.program.programId
      );
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    // console.log(file);
  }
}
