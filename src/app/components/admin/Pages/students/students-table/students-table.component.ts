import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChange,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { StudentTableService } from '../../../../shared/Services/student-table.service';
import { MatDialog } from '@angular/material/dialog';
import { StudentTableData } from '../../../shared/models/StudentTableData';
import { DeleteDialogueComponent } from '../../../../shared/delete-dialogue/delete-dialogue.component';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  NgForm,
} from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { noWhitespaceValidator } from 'src/app/components/shared/Validators/NoWhiteSpaceValidator';
import { LoginService } from 'src/app/components/shared/Services/login.service';
import { UserAddedComponent } from '../../../shared/user-added/user-added.component';
@Component({
  selector: 'app-students-table',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    MatSortModule,
    MatTableModule,
  ],
  templateUrl: './students-table.component.html',
  styleUrls: ['./students-table.component.scss'],
})
export class StudentsTableComponent implements OnInit, OnChanges {
  constructor(
    private studentService: StudentTableService,
    private _dialog: MatDialog,
    private snackBar: MatSnackBar,
    private loginService: LoginService
  ) {}
  editStudentReactiveForm!: FormGroup;
  editingRowID: number | null = null;
  courses: string[] = [];
  displayedColumns: string[] = [
    'actions',
    'studentCode',
    'studentName',
    'studentEmail',
  ];
  dataSource!: MatTableDataSource<StudentTableData>;

  isEmailSending: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.getStudents();
    this.editStudentReactiveForm = new FormGroup({
      studentCode: new FormControl(null, [
        Validators.required,
        noWhitespaceValidator(),
        Validators.maxLength(10),
      ]),
      studentName: new FormControl(null, [
        Validators.required,
        noWhitespaceValidator(),
        Validators.maxLength(20),
      ]),
      studentEmail: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        noWhitespaceValidator(),
      ]),
    });
  }
  // Search Filter
  @Input() filterValue!: string;

  // Refresh
  @Input() $clickEvent!: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filterValue']) {
      this.applyFilter(this.filterValue);
    }

    if (changes['$clickEvent']) {
      // console.log('REFRESHINGGGGGG');
      this.getStudents();
    }
  }

  applyFilter(filterValue: string) {
    // console.log(this.dataSource);
    if (this.dataSource) {
      this.dataSource.filter = this.filterValue.trim().toLowerCase();
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
  }

  getStudents() {
    this.studentService.getStudents().subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  saveStudents(row: StudentTableData) {
    if (
      this.editStudentReactiveForm.value.studentEmail == row.studentEmail &&
      this.editStudentReactiveForm.value.studentCode == row.studentCode &&
      this.editStudentReactiveForm.value.studentName == row.studentName
    ) {
      this.cancelEditing();
      return;
    }

    if (
      this.editStudentReactiveForm.valid &&
      this.editStudentReactiveForm.value.studentEmail == row.studentEmail
    ) {
      const customPayload = {
        studentName: this.editStudentReactiveForm.value.studentName,
        studentCode: this.editStudentReactiveForm.value.studentCode,
        teacherEmail: null,
      };

      this.studentService.editStudent(row.studentId, customPayload).subscribe({
        next: (data) => {
          this.getStudents();
          this.cancelEditing();
        },
        error: (error) => {
          this.snackBar.open(error.error, 'Close', {
            duration: 2000,
          });
        },
      });
    } else if (this.editStudentReactiveForm.valid) {
      this.isEmailSending = true;
      const sendingSnackBar = this.snackBar.open('Sending...', '', {
        duration: undefined, // The snackbar will not auto-dismiss
      });

      this.loginService
        .checkEmailValidity(this.editStudentReactiveForm.value.studentEmail)
        .subscribe({
          next: (data) => {
            this.studentService
              .editStudent(row.studentId, this.editStudentReactiveForm.value)
              .subscribe({
                next: (data) => {
                  sendingSnackBar.dismiss();
                  // Show "Email sent" message
                  this.isEmailSending = false;

                  this.cancelEditing();

                  this.getStudents();
                  const dialogRef = this._dialog.open(UserAddedComponent, {
                    data: {
                      targetStudentName: row.studentName,
                    },
                  });

                  dialogRef.afterClosed().subscribe((result) => {
                    if (result) {
                      // enable form
                    }
                  });
                },
                error: (error) => {
                  this.snackBar.open(error.error, 'Close', {
                    duration: 3000,
                  });
                  this.isEmailSending = false;
                  // Show error message
                },
              });
          },
          error: (error) => {
            this.isEmailSending = false;
            this.snackBar.open('Email already used !', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          },
        });
    }
  }

  editStudent(id: number, row: StudentTableData) {
    // console.log(row);
    this.editingRowID = id;
    this.editStudentReactiveForm.patchValue(row);
  }

  protected cancelEditing() {
    this.editingRowID = null;
    this.editStudentReactiveForm.reset();
  }

  protected deleteStudent(studentId: number, studentName: string) {
    const dialogRef = this._dialog.open(DeleteDialogueComponent, {
      data: { targetStudentName: studentName },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.studentService.deleteStudents(studentId).subscribe({
          next: (data) => {
            this.getStudents();
          },
          error: (error) => {
            console.log(error);
          },
        });
      }
    });
  }
}
