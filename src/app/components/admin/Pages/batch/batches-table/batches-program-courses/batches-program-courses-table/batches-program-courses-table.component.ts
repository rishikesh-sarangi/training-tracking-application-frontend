import { Component, Input, OnInit, ViewChild } from '@angular/core';
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
import { BatchProgramCoursesService } from 'src/app/components/shared/Services/batch-program-courses.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BatchServiceService } from 'src/app/components/shared/Services/batch-service.service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogueComponent } from 'src/app/components/shared/delete-dialogue/delete-dialogue.component';
import {
  CoursesDTO,
  TeacherDTO,
} from 'src/app/components/admin/shared/models/CoursesDTO';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-batches-program-courses-table',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './batches-program-courses-table.component.html',
  styleUrls: ['./batches-program-courses-table.component.scss'],
})
export class BatchesProgramCoursesTableComponent implements OnInit {
  editBatchProgramCoursesReactiveForm!: FormGroup;

  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['actions', 'code', 'courseName', 'teacherName'];

  courses: CoursesDTO[] = [];
  teachers: TeacherDTO[] = [];

  editingRowID: number | null = null;

  filteredCourses: CoursesDTO[] = [];

  @Input() programId!: number;
  @Input() batchId!: number;

  constructor(
    private batchService: BatchServiceService,
    private _dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getBatchProgramCoursesTeachers();
    this.getProgramCourse(this.programId, this.batchId);
    this.editBatchProgramCoursesReactiveForm = new FormGroup({
      code: new FormControl(null, Validators.required),
      courseName: new FormControl(null, Validators.required),
      teacherName: new FormControl(null, Validators.required),
    });
  }

  getBatchProgramCoursesTeachers() {
    this.batchService
      .getCoursesAndTeacher(this.batchId, this.programId)
      .subscribe((data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
  }

  // below 2 functions help in getting course and teacher for the edit fields
  getProgramCourse(programId: number, batchId: number) {
    this.batchService.getBatchProgramCourses(batchId, programId).subscribe({
      next: (data) => {
        this.courses = data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  filteredCoursesForEditing(currentCourseId: number): CoursesDTO[] {
    const registeredCourseIds = new Set(
      this.dataSource.data.map((item: any) => item.courseId)
    );
    return this.courses.filter(
      (course) =>
        course.courseId === currentCourseId ||
        !registeredCourseIds.has(course.courseId)
    );
  }

  onCourseChange(event: any) {
    const selectedCourse = event.value;
    const code = selectedCourse.courseCode;
    this.editBatchProgramCoursesReactiveForm.get('code')?.setValue(code);
    this.teachers = selectedCourse.teachers;
  }

  saveBatchProgramCourse(row: any) {
    if (this.editBatchProgramCoursesReactiveForm.valid) {
      const payload = {
        batchId: this.batchId,
        programId: this.programId,
        courseId: row.courseId,
        teacherId: row.teacherId,
      };

      this.batchService.deleteBatchProgramCourses(payload).subscribe({
        next: (data) => {
          // call insert logic
          const payload = {
            batchId: this.batchId,
            programId: this.programId,
            courseId:
              this.editBatchProgramCoursesReactiveForm.value.courseName
                .courseId,
            teacherId:
              this.editBatchProgramCoursesReactiveForm.value.teacherName
                .teacherId,
          };

          this.batchService.setBatchProgramCourses(payload).subscribe({
            next: (data) => {
              // console.log(data);
              this.getBatchProgramCoursesTeachers();
              this.cancelEditing();
            },
            error: (error) => {
              // console.log('THIS IS THE ERROR BELOW');
              // console.log(error);
              this.snackBar.open(
                'Course Already Exists under this teacher!',
                'Close',
                {
                  duration: 3000,
                }
              );
              console.log(error);
            },
          });
        },
        error: (error) => {
          console.log(error);
        },
      });
    }
  }

  deleteBatchProgramCourse(row: any) {
    // console.log(row);

    const payload = {
      batchId: this.batchId,
      programId: this.programId,
      courseId: row.courseId,
      teacherId: row.teacherId,
    };

    const dialogRef = this._dialog.open(DeleteDialogueComponent, {
      data: {
        targetCourseNameBatch: row.courseName,
        targetTeacherNameBatch: row.teacherName,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.batchService.deleteBatchProgramCourses(payload).subscribe({
          next: (data) => {
            this.getBatchProgramCoursesTeachers();
          },
          error: (error) => {
            console.log(error);
          },
        });
      }
    });
  }

  editBatchProgramCourse(i: number, row: any) {
    this.editingRowID = i;

    // Find the course object that matches the current row
    const selectedCourse = this.courses.find(
      (course) => course.courseCode === row.courseCode
    );

    // Find the teacher object that matches the current row
    const selectedTeacher = this.teachers.find(
      (teacher) => teacher.teacherName === row.teacherName
    );

    const filteredCourses = this.filteredCoursesForEditing(row.courseId);

    this.editBatchProgramCoursesReactiveForm.patchValue({
      code: row.courseCode,
      courseName: selectedCourse,
      teacherName: selectedTeacher,
    });

    this.filteredCourses = filteredCourses;

    // Update the teachers list based on the selected course
    if (selectedCourse) {
      this.teachers = selectedCourse.teachers;
    }
  }

  cancelEditing() {
    this.editingRowID = null;
    this.editBatchProgramCoursesReactiveForm.reset();
  }
}
