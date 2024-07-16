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
import { TeachersTableService } from 'src/app/components/shared/Services/teachers-table.service';
import { CourseTableDataService } from 'src/app/components/shared/Services/course-table-data.service';
import { BatchProgramsService } from 'src/app/components/shared/Services/batch-programs.service';
import { BatchProgramCoursesService } from 'src/app/components/shared/Services/batch-program-courses.service';
import { BatchServiceService } from 'src/app/components/shared/Services/batch-service.service';
import {
  CoursesDTO,
  TeacherDTO,
} from 'src/app/components/admin/shared/models/CoursesDTO';
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

  courses: CoursesDTO[] = [];
  teachers: TeacherDTO[] = [];
  courseCode: string[] = [];

  constructor(
    private programService: ProgramsTableService,
    private teacherService: TeachersTableService,
    private courseService: CourseTableDataService,
    private batchService: BatchServiceService
  ) {}

  ngOnInit(): void {
    // this.getCourses();
    // this.getTeachers();
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
        this.courses = data;
      },
      error: (error) => {
        console.log(error);
      },
    });
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
          console.log(error);
        },
      });
    }
  }

  onCourseChange(event: any) {
    // console.log(event.value);
    const index = this.courses.indexOf(event.value);
    const code = this.courses[index].courseCode;
    // console.log(code);
    this.addBatchProgramCoursesReactiveForm.get('code')?.setValue(code);

    this.teachers = event.value.teachers;
    console.log(this.teachers);
  }

  @Output() isAddClicked: EventEmitter<boolean> = new EventEmitter<boolean>();
  closeForm() {
    this.isAddClicked.emit(false);
    // console.log(this.isAddClicked);
  }
}
