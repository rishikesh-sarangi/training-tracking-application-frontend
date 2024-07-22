import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  NgForm,
  FormsModule,
} from '@angular/forms';
import { CourseTableDataService } from '../../../shared/Services/course-table-data.service';
import { StudentTableService } from '../../../shared/Services/student-table.service';
import { StudentsTableComponent } from './students-table/students-table.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { noWhitespaceValidator } from 'src/app/components/shared/Validators/NoWhiteSpaceValidator';
import { LoginService } from 'src/app/components/shared/Services/login.service';
@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    StudentsTableComponent,
  ],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss'],
})
export class StudentsComponent {
  constructor(
    private studentService: StudentTableService,
    private snackBar: MatSnackBar,
    private loginService: LoginService
  ) {}

  isAddStudentClicked: boolean = false;
  isEmailSending: boolean = false;
  addStudentReactiveForm!: FormGroup;
  displayedColumns: string[] = [
    'actions',
    'studentCode',
    'studentName',
    'studentEmail',
  ];

  ngOnInit(): void {
    this.addStudentReactiveForm = new FormGroup({
      studentCode: new FormControl(null, [
        Validators.required,
        noWhitespaceValidator(),
      ]),
      studentName: new FormControl(null, [
        Validators.required,
        noWhitespaceValidator(),
      ]),
      studentEmail: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        noWhitespaceValidator(),
      ]),
    });
  }

  protected onSubmit() {
    if (this.addStudentReactiveForm.valid) {
      this.isEmailSending = true;
      const sendingSnackBar = this.snackBar.open('Sending...', '', {
        duration: undefined, // The snackbar will not auto-dismiss
      });

      this.loginService
        .checkEmailValidity(this.addStudentReactiveForm.value.studentEmail)
        .subscribe({
          next: (data) => {
            this.studentService
              .addStudent(this.addStudentReactiveForm.value)
              .subscribe({
                next: (data) => {
                  // console.log(data);
                  this.isEmailSending = false;

                  sendingSnackBar.dismiss();

                  // Show "Email sent" message
                  this.snackBar.open('Email sent', 'Close', {
                    duration: 3000,
                  });

                  this.isAddStudentClicked = !this.isAddStudentClicked;
                },
                error: (err) => {
                  this.isEmailSending = false;
                  sendingSnackBar.dismiss();

                  // Show error message
                  this.snackBar.open(err, 'Close', {
                    duration: 3000,
                  });
                },
              });
          },
          error: (err) => {
            this.isEmailSending = false;
            this.snackBar.open('Email is already used !', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          },
        });
    }
  }

  closeForm() {
    this.addStudentReactiveForm.reset();
    this.isAddStudentClicked = !this.isAddStudentClicked;
  }

  $clickEvent!: any;
  refresh($event: any) {
    this.$clickEvent = $event;
    // console.log('parent clicked');
  }

  // Search Filter
  SearchValue: string = '';
  onSearchChange(event: any) {
    this.SearchValue = (event.target as HTMLInputElement).value;
  }
}
