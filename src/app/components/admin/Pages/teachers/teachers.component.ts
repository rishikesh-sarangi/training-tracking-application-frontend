import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { NgFor } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
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
import { TeachersTableService } from '../../../shared/Services/teachers-table.service';
import { TeachersTableComponent } from './teachers-table/teachers-table.component';
import { TeachersTableData } from '../../shared/models/TeachersTableData';
import { TableData } from '../../shared/models/CourseTableData';
import { MatSnackBar } from '@angular/material/snack-bar';
import { noWhitespaceValidator } from 'src/app/components/shared/Validators/NoWhiteSpaceValidator';
import { LoginService } from 'src/app/components/shared/Services/login.service';
@Component({
  selector: 'app-teachers',
  standalone: true,
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    TeachersTableComponent,
    FormsModule,
  ],
})
export class TeachersComponent implements OnInit {
  constructor(
    private courseTableData: CourseTableDataService,
    private teacherService: TeachersTableService,
    private snackBar: MatSnackBar,
    private loginService: LoginService
  ) {}

  protected isAddTeacherClicked: boolean = false;
  protected addTeacherReactiveForm!: FormGroup;

  isEmailSending: boolean = false;

  displayedColumns: string[] = [
    'actions',
    'teacherName',
    'courses',
    'teacherEmail',
  ];

  courses: TableData[] = [];
  ngOnInit(): void {
    this.getCourses();
    this.addTeacherReactiveForm = new FormGroup({
      teacherName: new FormControl(null, [
        Validators.required,
        noWhitespaceValidator(),
      ]),
      courses: new FormControl(null, [Validators.required]),
      teacherEmail: new FormControl(null, [
        Validators.required,
        noWhitespaceValidator(),
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ]),
    });
  }

  protected getCourses() {
    this.courseTableData.getCourses().subscribe({
      next: (data) => {
        this.courses = data;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  protected onSubmit() {
    if (this.addTeacherReactiveForm.valid) {
      this.isEmailSending = true;
      const sendingSnackBar = this.snackBar.open('Sending...', '', {
        duration: undefined, // The snackbar will not auto-dismiss
      });

      // disable form
      this.addTeacherReactiveForm.disable();

      // console.log(this.addTeacherReactiveForm.value.teacherEmail);
      this.loginService
        .checkEmailValidity(this.addTeacherReactiveForm.value.teacherEmail)
        .subscribe({
          next: (data) => {
            // console.log('triggered');
            this.teacherService
              .addTeachers(this.addTeacherReactiveForm.value)
              .subscribe({
                next: (data) => {
                  // console.log(data);
                  this.isEmailSending = false;

                  sendingSnackBar.dismiss();

                  // Show "Email sent" message
                  this.snackBar.open('Email sent', 'Close', {
                    duration: 3000,
                  });

                  // enable form
                  this.addTeacherReactiveForm.enable();

                  this.closeForm();
                },
                error: (err) => {
                  sendingSnackBar.dismiss();

                  this.isEmailSending = false;

                  // Show error message
                  this.snackBar.open('Error sending email', 'Close', {
                    duration: 3000,
                  });

                  console.log(err);
                },
              });
          },

          error: (err) => {
            this.isEmailSending = false;
            // enable reactive form
            this.addTeacherReactiveForm.enable();
            this.snackBar.open('Email is already used !', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          },
        });
    }
  }

  protected closeForm() {
    this.addTeacherReactiveForm.reset();
    this.isAddTeacherClicked = !this.isAddTeacherClicked;
  }

  // Refresh
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
