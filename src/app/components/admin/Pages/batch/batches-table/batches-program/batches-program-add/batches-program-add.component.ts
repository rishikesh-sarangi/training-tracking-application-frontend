import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
import { ProgramsTableService } from 'src/app/components/shared/Services/programs-table.service';
import { StudentTableService } from 'src/app/components/shared/Services/student-table.service';
import { BatchProgramsService } from 'src/app/components/shared/Services/batch-programs.service';
import {
  BatchLayer2Data,
  BatchPrograms,
} from 'src/app/components/admin/shared/models/batch-layer2.model';
import { ProgramsTable } from 'src/app/components/admin/shared/models/ProgramsTable';
import { EnrollmentService } from 'src/app/components/shared/Services/enrollment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BatchServiceService } from 'src/app/components/shared/Services/batch-service.service';

@Component({
  selector: 'app-batches-program-add',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './batches-program-add.component.html',
  styleUrls: ['./batches-program-add.component.scss'],
})
export class BatchesProgramAddComponent implements OnInit {
  addBatchProgramReactiveForm!: FormGroup;

  // comes from parent
  @Input() batchId!: number;

  programs: ProgramsTable[] = [];

  students: any[] = [];

  displayedColumns: string[] = ['actions', 'code', 'programName', 'students'];

  constructor(
    private programService: ProgramsTableService,
    private studentService: StudentTableService,
    private batchService: BatchServiceService,
    private enrollmentService: EnrollmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // reactive form init
    this.getPrograms();
    this.getStudents();
    this.addBatchProgramReactiveForm = new FormGroup({
      code: new FormControl(null, Validators.required),
      programs: new FormControl(null, Validators.required),
      students: new FormControl(null, Validators.required),
    });
  }

  getPrograms() {
    this.programService.getPrograms().subscribe({
      next: (allPrograms: any) => {
        this.batchService.getBatchPrograms(this.batchId).subscribe({
          next: (existingPrograms: any) => {
            // Create a Set of existing program IDs for quick lookup
            const existingProgramIds = new Set(
              existingPrograms.map(
                (program: ProgramsTable) => program.programId
              )
            );

            // Filter out the programs that are already in the batch
            this.programs = allPrograms.filter(
              (program: ProgramsTable) =>
                !existingProgramIds.has(program.programId)
            );
          },
          error: (error) => {
            if (error.responseCode === 404) {
              // If no existing programs found, set programs to all available programs
              this.programs = allPrograms;
            } else {
              console.error('Error fetching batch programs:', error);
            }
          },
        });
      },
      error: (err) => {
        console.error('Error fetching all programs:', err);
      },
    });
  }

  getStudents() {
    this.studentService.getStudents().subscribe({
      next: (data: any) => {
        for (const student of data) {
          // console.log(student);
          if (student.batch == null || student.batch.batchId == this.batchId) {
            this.students.push(student);
          }
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  onProgramChange(event: any) {
    const index = this.programs.indexOf(event.value);
    const code = this.programs[index].programCode;
    // console.log(code);
    this.addBatchProgramReactiveForm.get('code')?.setValue(code);
  }

  onSubmit() {
    // console.log(this.batchId);
    if (this.addBatchProgramReactiveForm.valid) {
      const payload = {
        batchId: this.batchId,
        programId: this.addBatchProgramReactiveForm.value.programs.programId,
        students: this.addBatchProgramReactiveForm.value.students,
      };

      // console.log(payload);
      this.enrollmentService.enrollStudents(payload).subscribe(
        (data) => {
          // console.log(data);
          this.closeForm();
        },
        (err) => {
          this.snackBar.open(err, 'Close', {
            duration: 3000,
          });
        }
      );
    }
  }

  // send boolean value from child to parent to let them know that the add program form must be closed
  @Output() isAddClicked: EventEmitter<boolean> = new EventEmitter<boolean>();
  closeForm() {
    this.isAddClicked.emit(false);
    // console.log(this.isAddClicked);
  }
}
