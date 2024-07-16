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
    private snackBar: MatSnackBar
  ) {}

  isAddStudentClicked: boolean = false;
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
      const sendingSnackBar = this.snackBar.open('Sending...', '', {
        duration: undefined, // The snackbar will not auto-dismiss
      });

      this.studentService
        .addStudent(this.addStudentReactiveForm.value)
        .subscribe({
          next: (data) => {
            // console.log(data);

            sendingSnackBar.dismiss();

            // Show "Email sent" message
            this.snackBar.open('Email sent', 'Close', {
              duration: 3000,
            });

            this.isAddStudentClicked = !this.isAddStudentClicked;
          },
          error: (err) => {
            sendingSnackBar.dismiss();

            // Show error message
            this.snackBar.open(err, 'Close', {
              duration: 3000,
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
