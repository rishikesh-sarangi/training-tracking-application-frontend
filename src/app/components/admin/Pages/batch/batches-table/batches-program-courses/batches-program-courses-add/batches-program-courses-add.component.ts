import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BatchServiceService } from 'src/app/components/shared/Services/batch-service.service';
import {
  CoursesDTO,
  TeacherDTO,
} from 'src/app/components/admin/shared/models/CoursesDTO';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-batches-program-courses-add',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './batches-program-courses-add.component.html',
  styleUrls: ['./batches-program-courses-add.component.scss'],
})
export class BatchesProgramCoursesAddComponent implements OnInit {
  addBatchProgramCoursesReactiveForm!: FormGroup;
  displayedColumns: string[] = ['actions', 'code', 'courseName', 'teacherName'];

  @Input() programId!: number;
  @Input() batchId!: number;

  assignedCourses: any[] = [];
  courses: CoursesDTO[] = [];
  teachers: TeacherDTO[] = [];
  courseCode: string[] = [];

  constructor(
    private batchService: BatchServiceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getBatchProgramCoursesTeachers();
    this.getProgramCourse(this.programId, this.batchId);
    // console.log(this.programId + ' ' + this.batchId);
    this.addBatchProgramCoursesReactiveForm = new FormGroup({
      code: new FormControl(null, Validators.required),
      course: new FormControl(null, Validators.required),
      teacher: new FormControl(null, Validators.required),
    });
  }

  getProgramCourse(programId: number, batchId: number) {
    this.batchService.getBatchProgramCourses(batchId, programId).subscribe({
      next: (data) => {
        // Filter out the courses that are already assigned
        this.courses = data.filter(
          (course) =>
            !this.assignedCourses.some(
              (assignedCourse) => assignedCourse.courseId === course.courseId
            )
        );
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  getBatchProgramCoursesTeachers() {
    this.batchService
      .getCoursesAndTeacher(this.batchId, this.programId)
      .subscribe((data) => {
        this.assignedCourses = data;
      });
  }

  onCourseChange(event: any) {
    // console.log(event.value);
    const index = this.courses.indexOf(event.value);
    const code = this.courses[index].courseCode;
    // console.log(code);
    this.addBatchProgramCoursesReactiveForm.get('code')?.setValue(code);

    this.teachers = event.value.teachers;
    // console.log(this.teachers);
  }

  onSubmit() {
    if (this.addBatchProgramCoursesReactiveForm.valid) {
      // console.log(this.addBatchProgramCoursesReactiveForm.value);

      const payload = {
        batchId: this.batchId,
        programId: this.programId,
        courseId: this.addBatchProgramCoursesReactiveForm.value.course.courseId,
        teacherId:
          this.addBatchProgramCoursesReactiveForm.value.teacher.teacherId,
      };

      // console.log(payload);
      this.batchService.setBatchProgramCourses(payload).subscribe({
        next: (data) => {
          // console.log(data);
          this.closeForm();
        },
        error: (error) => {
          // console.log('THIS IS THE ERROR BELOW');
          // console.log(error);
          this.snackBar.open('Course Already Exists!', 'Close', {
            duration: 3000,
          });
          console.log(error);
        },
      });
    }
  }

  @Output() isAddClicked: EventEmitter<boolean> = new EventEmitter<boolean>();
  closeForm() {
    this.isAddClicked.emit(false);
    // console.log(this.isAddClicked);
  }
}
