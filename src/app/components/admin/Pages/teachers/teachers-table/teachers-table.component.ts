import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as _ from 'lodash';
import { MaterialModule } from 'src/app/material.module';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  NgForm,
} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { TeachersTableData } from '../../../shared/models/TeachersTableData';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { TeachersTableService } from '../../../../shared/Services/teachers-table.service';
import { CourseTableDataService } from '../../../../shared/Services/course-table-data.service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogueComponent } from '../../../../shared/delete-dialogue/delete-dialogue.component';
import { TableData } from '../../../shared/models/CourseTableData';
import { MatSnackBar } from '@angular/material/snack-bar';
import { noWhitespaceValidator } from 'src/app/components/shared/Validators/NoWhiteSpaceValidator';
import { LoginService } from 'src/app/components/shared/Services/login.service';
@Component({
  selector: 'app-teachers-table',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './teachers-table.component.html',
  styleUrls: ['./teachers-table.component.scss'],
})
export class TeachersTableComponent implements OnInit, OnChanges {
  constructor(
    private teachersService: TeachersTableService,
    private coursesService: CourseTableDataService,
    private _dialog: MatDialog,
    private snackBar: MatSnackBar,
    private loginService: LoginService
  ) {}

  editTeachersReactiveForm!: FormGroup;
  isEmailSending: boolean = false;
  editingRowID: number = -1;
  courses: TableData[] = [];
  displayedColumns: string[] = [
    'actions',
    'teacherName',
    'courses',
    'teacherEmail',
  ];
  dataSource!: MatTableDataSource<TeachersTableData>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.getCourses();

    this.editTeachersReactiveForm = new FormGroup({
      teacherName: new FormControl(null, [
        Validators.required,
        noWhitespaceValidator(),
      ]),
      courses: new FormControl([], [Validators.required]),
      teacherEmail: new FormControl(null, [
        Validators.required,
        noWhitespaceValidator(),
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
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
      this.getTeachers();
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

  getTeachers() {
    this.teachersService.getTeachers().subscribe({
      next: (data) => {
        // console.log('getTeachers' + data);
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  getCourses() {
    this.coursesService.getCourses().subscribe({
      next: (data) => {
        // console.log(data);
        this.courses = data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  saveTeacher(row: TeachersTableData) {
    const areCoursesChanged = () => {
      const formCourses = this.editTeachersReactiveForm.value.courses;
      const rowCourses = row.courses;

      if (formCourses.length !== rowCourses.length) {
        return true;
      }

      const formCourseIds = new Set(formCourses.map((c: any) => c.courseId));
      const rowCourseIds = new Set(rowCourses.map((c: any) => c.courseId));

      return (
        ![...formCourseIds].every((id) => rowCourseIds.has(id)) ||
        ![...rowCourseIds].every((id) => formCourseIds.has(id))
      );
    };

    if (
      this.editTeachersReactiveForm.value.teacherEmail === row.teacherEmail &&
      this.editTeachersReactiveForm.value.teacherName === row.teacherName &&
      !areCoursesChanged()
    ) {
      this.cancelEditing();
      return;
    }

    if (
      this.editTeachersReactiveForm.valid &&
      this.editTeachersReactiveForm.value.teacherEmail === row.teacherEmail
    ) {
      const customPayload = {
        teacherName: this.editTeachersReactiveForm.value.teacherName,
        courses: this.editTeachersReactiveForm.value.courses,
        oldEmail: row.teacherEmail,
        newEmail: null,
      };

      this.teachersService
        .editTeachers(row.teacherId, customPayload)
        .subscribe({
          next: (data) => {
            this.cancelEditing();
            this.getTeachers();
          },
          error: (error) => {
            console.log(error);
          },
        });
    } else if (this.editTeachersReactiveForm.valid) {
      this.isEmailSending = true;
      const sendingSnackBar = this.snackBar.open('Sending...', '', {
        duration: undefined,
      });

      const customPayload = {
        teacherName: this.editTeachersReactiveForm.value.teacherName,
        courses: this.editTeachersReactiveForm.value.courses,
        oldEmail: row.teacherEmail,
        newEmail: this.editTeachersReactiveForm.value.teacherEmail,
      };

      this.loginService.checkEmailValidity(customPayload.newEmail).subscribe({
        next: (data) => {
          this.teachersService
            .editTeachers(row.teacherId, customPayload)
            .subscribe({
              next: (data) => {
                this.isEmailSending = false;
                sendingSnackBar.dismiss();
                this.snackBar.open('Email sent', 'Close', {
                  duration: 3000,
                });
                this.cancelEditing();
                this.getTeachers();
              },
              error: (error) => {
                this.isEmailSending = false;
                sendingSnackBar.dismiss();
                this.snackBar.open(error, 'Close', {
                  duration: 3000,
                });
              },
            });
        },
        error: (error) => {
          this.isEmailSending = false;
          this.snackBar.open('Email is already used !', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
          });
        },
      });
    }
  }

  editTeacher(id: number, row: TeachersTableData) {
    this.editingRowID = id;

    const selectedCourses = this.courses.filter((course) =>
      row.courses.some(
        (teacherCourse) => teacherCourse.courseId === course.courseId
      )
    );

    this.editTeachersReactiveForm.patchValue({
      teacherName: row.teacherName,
      teacherEmail: row.teacherEmail,
      courses: selectedCourses,
    });
  }

  protected cancelEditing() {
    this.editingRowID = -1;
    this.editTeachersReactiveForm.reset();
  }

  protected deleteTeacher(teacherId: number, teacherName: string) {
    const dialogRef = this._dialog.open(DeleteDialogueComponent, {
      data: { targetTeacherName: teacherName },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.teachersService.deleteTeachers(teacherId).subscribe({
          next: (data) => {
            this.getTeachers();
          },
          error: (error) => {
            console.log(error);
          },
        });
      }
    });
  }

  getRemainingCoursesWithNumbers(courses: any[]): string {
    const remainingCourses = courses.slice(2);
    const numberedCourses = remainingCourses.map(
      (course, index) => `${index + 1}.${course.courseName}`
    );
    return numberedCourses.join('\n'); // Join with a newline character
  }
}
