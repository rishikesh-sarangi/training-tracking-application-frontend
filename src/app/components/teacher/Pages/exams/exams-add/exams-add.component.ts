import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { EvaluationService } from '../../../shared/Services/evaluation.service';
import { MatDialog } from '@angular/material/dialog';
import { SingleFileUploadComponent } from '../../../shared/single-file-upload/single-file-upload.component';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-exams-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './exams-add.component.html',
  styleUrls: ['./exams-add.component.scss'],
})
export class ExamsAddComponent {
  constructor(
    private evaluationService: EvaluationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  @Input() openExamForm: boolean = false;
  @Input() parentPayload!: any;

  // reusing the component for assignments as well
  @Input() isAssignments: boolean = false;

  @Output() closeExamForm = new EventEmitter<boolean>();

  displayedColumns: string[] = [];

  temporaryFile: File | null = null;

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

  sharedReactiveForm!: FormGroup;

  ngOnInit(): void {
    this.setUpColumns();
    // console.log(this.displayedColumns);
    // console.log(this.parentPayload);
    this.sharedReactiveForm = new FormGroup({
      [this.isAssignments ? 'assignmentName' : 'examName']: new FormControl(
        null,
        [
          Validators.required,
          Validators.pattern(/^[\S]+(\s+[\S]+)*$/), // regex for no whitespace
        ]
      ),
      totalMarks: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^[0-9]+$/), // regex for numbers only
      ]),
      [this.isAssignments ? 'assignmentDate' : 'examDate']: new FormControl(
        null,
        [Validators.required, Validators.pattern(/^[\S]+(\s+[\S]+)*$/)]
      ),
      [this.isAssignments ? 'assignmentTime' : 'examTime']: new FormControl(
        null,
        [Validators.required, Validators.pattern(/^[\S]+(\s+[\S]+)*$/)]
      ),
      uploadFile: new FormControl(null),
    });
  }
  onSubmit() {
    if (this.sharedReactiveForm.valid) {
      const examPayload = {
        ...this.parentPayload,
        evaluationName: this.sharedReactiveForm.get(
          this.isAssignments ? 'assignmentName' : 'examName'
        )?.value,
        evaluationType: this.isAssignments ? 'assignment' : 'exam',
        evaluationDate: this.sharedReactiveForm.get(
          this.isAssignments ? 'assignmentDate' : 'examDate'
        )?.value,
        evaluationTime: this.sharedReactiveForm.get(
          this.isAssignments ? 'assignmentTime' : 'examTime'
        )?.value,
        totalMarks: this.sharedReactiveForm.value.totalMarks,
      };
      // console.log(examPayload);

      this.evaluationService.addEvaluation(examPayload).subscribe(
        (res) => {
          // console.log(res);
          const evaluationId = res.data[0].evaluationId;
          if (this.temporaryFile) {
            this.uploadFile(evaluationId);
          }
          this.closeForm();
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }

  closeForm() {
    this.openExamForm = !this.openExamForm;
    this.closeExamForm.emit(this.openExamForm);
    this.sharedReactiveForm.reset();
  }

  onFilesUploadClick() {
    const dialogRef = this.dialog.open(SingleFileUploadComponent, {
      data: {
        isTemporary: true,
      },
    });

    dialogRef.afterClosed().subscribe((result: File | undefined) => {
      if (result) {
        this.temporaryFile = result;
      }
    });
  }

  uploadFile(evaluationId: string) {
    if (this.temporaryFile) {
      const formData = new FormData();
      formData.append('file', this.temporaryFile, this.temporaryFile.name);

      this.evaluationService.uploadFile(evaluationId, formData).subscribe(
        (res) => {
          console.log('File uploaded successfully');
          this.temporaryFile = null;
          this.sharedReactiveForm.reset();
          this.closeForm();
        },
        (err) => {
          this.snackBar.open(err.error.message, 'Close', { duration: 3000 });
        }
      );
    }
  }
}
