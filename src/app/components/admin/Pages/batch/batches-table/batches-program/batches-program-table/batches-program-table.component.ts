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
import { BatchProgramsService } from 'src/app/components/shared/Services/batch-programs.service';
import { StudentTableService } from 'src/app/components/shared/Services/student-table.service';
import { ProgramsTableService } from 'src/app/components/shared/Services/programs-table.service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogueComponent } from 'src/app/components/shared/delete-dialogue/delete-dialogue.component';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { BatchesProgramCoursesAddComponent } from '../../batches-program-courses/batches-program-courses-add/batches-program-courses-add.component';
import { BatchesProgramCoursesTableComponent } from '../../batches-program-courses/batches-program-courses-table/batches-program-courses-table.component';
import { BatchServiceService } from 'src/app/components/shared/Services/batch-service.service';
import { EnrollmentService } from 'src/app/components/shared/Services/enrollment.service';
import { ProgramsTable } from 'src/app/components/admin/shared/models/ProgramsTable';
@Component({
  selector: 'app-batches-program-table',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    BatchesProgramCoursesTableComponent,
    BatchesProgramCoursesAddComponent,
  ],
  templateUrl: './batches-program-table.component.html',
  styleUrls: ['./batches-program-table.component.scss'],
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
export class BatchesProgramTableComponent implements OnInit, OnChanges {
  editBatchProgramReactiveForm!: FormGroup;
  editingRowID: number = -1;
  displayedColumns: string[] = ['actions', 'code', 'programName', 'students'];

  students: any[] = [];
  studentsByBatchAndProgram: any[] = [];

  programIdForChild!: number;

  dataSource!: any;

  programs: ProgramsTable[] = [];

  // from parent
  @Input() batchId!: number;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['batchId'] && this.batchId) {
      this.getBatchPrograms();
    }
  }

  constructor(
    private studentService: StudentTableService,
    private batchService: BatchServiceService,
    private _dialog: MatDialog,
    private enrollmentService: EnrollmentService,
    private programService: ProgramsTableService
  ) {}

  ngOnInit(): void {
    this.getStudents();
    this.getPrograms();
    // console.log(this.batchId);
    this.editBatchProgramReactiveForm = new FormGroup({
      code: new FormControl(null, Validators.required),
      programName: new FormControl(null, Validators.required),
      students: new FormControl(null, Validators.required),
    });
  }

  // while editing the entire student list should be visible
  getStudents() {
    this.studentService.getStudents().subscribe({
      next: (data) => {
        // console.log(data);
        this.students = data;
      },
    });
  }

  studentsByProgram: { [programId: number]: any[] } = {};

  getPrograms() {
    this.programService.getPrograms().subscribe({
      next: (res: any) => {
        for (const obj of res) {
          // this.programCodes.push(obj.programCode);
          // this.programNames.push(obj.programName);
          this.programs.push(obj);
        }

        // console.log(this.programCodes + '|' + this.programNames);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  getStudentsForRow(row: any): any[] {
    if (!this.studentsByProgram[row.programId]) {
      this.getStudentsByBatchAndProgram(row.programId);
      return []; // Return an empty array while data is being fetched
    }
    return this.studentsByProgram[row.programId];
  }

  getStudentsByBatchAndProgram(programId: number) {
    if (!this.studentsByProgram[programId]) {
      this.studentService
        .getStudentsByBatchAndProgram(this.batchId, programId)
        .subscribe({
          next: (data) => {
            this.studentsByProgram[programId] = data;
          },
        });
    }
  }

  onProgramChange(event: any) {
    const index = this.programs.indexOf(event.value);
    const code = this.programs[index].programCode;
    // console.log(code);
    this.editBatchProgramReactiveForm.get('code')?.setValue(code);
  }

  editBatchProgram(id: number, row: any) {
    this.editingRowID = id;
    this.editBatchProgramReactiveForm.patchValue(row);
  }

  deleteBatchProgram(row: any) {
    const dialogRef = this._dialog.open(DeleteDialogueComponent, {
      data: {
        targetBatchCode_programs: this.batchId,
        targetBatchProgramName: row.programName,
        targetBatchProgramCode: row.programCode,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.batchService
          .deleteProgramBatch(row.programId, this.batchId)
          .subscribe({
            next: (data) => {
              console.log(data);
              this.getBatchPrograms();
            },
            error: (error) => {
              console.log(error);
            },
          });
      }
    });
  }

  saveBatchProgram(row: any) {
    if (this.editBatchProgramReactiveForm.valid) {
      const payload = {
        batchId: this.batchId,
        programId:
          this.editBatchProgramReactiveForm.value.programName.programId,
        oldProgramId: row.programId,
        students: this.editBatchProgramReactiveForm.value.students,
      };

      this.enrollmentService.updateEnrollment(payload).subscribe({
        next: (data) => {
          // // Update the local data
          // const updatedRow = this.dataSource.find(
          //   (item: any) => item.programId === payload.programId
          // );
          // if (updatedRow) {
          //   updatedRow.programName =
          //     this.editBatchProgramReactiveForm.value.programName.programName;
          //   updatedRow.programCode =
          //     this.editBatchProgramReactiveForm.value.code;

          //   // Update the studentsByProgram for this program
          //   this.studentsByProgram[payload.programId] = payload.students;
          // }

          this.studentsByProgram[payload.programId] = payload.students;

          // Trigger change detection
          this.dataSource = [...this.dataSource];

          this.getBatchPrograms();
          this.cancelEditing();
        },
        error: (error) => {
          console.log(error);
        },
      });
    }
  }

  cancelEditing() {
    this.editingRowID = -1;
    this.editBatchProgramReactiveForm.reset();
  }

  getBatchPrograms() {
    this.batchService.getBatchPrograms(this.batchId).subscribe({
      next: (data) => {
        // console.log(data);
        this.dataSource = data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  getRemainingStudentsWithNumbers(students: any[]): string {
    const remainingStudent = students.slice(2);
    const numberedStudents = remainingStudent.map(
      (student, index) => `${index + 1}.${student.studentName}`
    );
    return numberedStudents.join('\n'); // Join with a newline character
  }

  isAddClicked: boolean = false;
  isTableClicked: boolean = false;

  expandedRowAdd!: any;
  expandedRowTable!: any;

  toggleAdd(row: any, i: number) {
    this.expandedRowAdd = this.expandedRowAdd == row ? null : row;
    this.isAddClicked = !this.isAddClicked;
    this.programIdForChild = row.programId;
  }
  toggleTable(row: any) {
    this.expandedRowTable = this.expandedRowTable == row ? null : row;
    this.isTableClicked = !this.isTableClicked;
    this.programIdForChild = row.programId;
  }

  recieveIsAddClicked(value: boolean) {
    this.expandedRowTable = null;
    this.expandedRowAdd = null;

    this.isAddClicked = value;
  }
}
