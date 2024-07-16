import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import * as _ from 'lodash';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  NgForm,
  FormsModule,
} from '@angular/forms';
import { ProgramsTableService } from 'src/app/components/shared/Services/programs-table.service';
import { DeleteDialogueComponent } from '../../../../../shared/delete-dialogue/delete-dialogue.component';
import { MatDialog } from '@angular/material/dialog';
import { TopicsData } from 'src/app/components/admin/shared/models/topics-table.model';
import { MatTableDataSource } from '@angular/material/table';
import { CourseTableDataService } from 'src/app/components/shared/Services/course-table-data.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ProgramsTable } from 'src/app/components/admin/shared/models/ProgramsTable';
import { TableData } from 'src/app/components/admin/shared/models/CourseTableData';
import { noWhitespaceValidator } from 'src/app/components/shared/Validators/NoWhiteSpaceValidator';
@Component({
  selector: 'app-programs-table',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, FormsModule],
  templateUrl: './programs-table.component.html',
  styleUrls: ['./programs-table.component.scss'],
})
export class ProgramsTableComponent {
  constructor(
    private programService: ProgramsTableService,
    private courseService: CourseTableDataService,
    private _dialog: MatDialog
  ) {}

  protected editingRowID: number | null = null;

  protected isDescOpen: boolean = false;

  protected editProgramsReactiveForm!: FormGroup;

  protected courses: TableData[] = [];

  dataSource!: MatTableDataSource<ProgramsTable>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = [
    'actions',
    'programCode',
    'programName',
    'theoryTime',
    'practiceTime',
    'description',
    'courses',
  ];

  ngOnInit(): void {
    this.getProgramsList();
    this.getCourses();

    this.editProgramsReactiveForm = new FormGroup({
      programCode: new FormControl(null, [
        Validators.required,
        noWhitespaceValidator(),
      ]),
      programName: new FormControl(null, [
        Validators.required,
        noWhitespaceValidator(),
      ]),
      theoryTime: new FormControl(null, [
        Validators.required,
        Validators.pattern('[0-9]*'),
      ]),
      practiceTime: new FormControl(null, [
        Validators.required,
        Validators.pattern('[0-9]*'),
      ]),
      description: new FormControl(null, [
        Validators.required,
        noWhitespaceValidator(),
        Validators.maxLength(40),
      ]),
      courses: new FormControl(null, [Validators.required]),
    });
  }

  getProgramsList() {
    this.programService.getPrograms().subscribe({
      next: (res: any) => {
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  getCourses() {
    this.courseService.getCourses().subscribe({
      next: (data) => {
        this.courses = data;
        // console.log(data);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  editPrograms(id: number, row: ProgramsTable) {
    this.editingRowID = id;
    // this.editProgramsReactiveForm.patchValue(row);
    // console.log(this.editProgramsReactiveForm.value);

    // console.log(row.courses);

    const selectedCourses = this.courses.filter((course) =>
      row.courses.some(
        (programCourse) => programCourse.courseId === course.courseId
      )
    );

    // console.log(selectedCourses);

    this.editProgramsReactiveForm.patchValue({
      programCode: row.programCode,
      programName: row.programName,
      theoryTime: row.theoryTime,
      practiceTime: row.practiceTime,
      description: row.description,
      courses: selectedCourses,
    });
  }

  deletePrograms(id: number, code: string, programName: string) {
    const dialogRef = this._dialog.open(DeleteDialogueComponent, {
      data: { targetProgramCode: code, targetProgramName: programName },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.programService.deleteProgram(id).subscribe({
          next: (data) => {
            // console.log(data);
            this.getProgramsList();
          },
          error: (error) => {
            console.log(error);
          },
        });
      }
    });
  }

  savePrograms(row: any) {
    // console.log(this.editProgramsReactiveForm.valid);

    const areAllCoursesEqual: boolean =
      this.editProgramsReactiveForm.value.courses.every(
        (formCourse: any, index: any) => {
          return (
            formCourse.courseId === row.courses[index].courseId &&
            formCourse.code === row.courses[index].code &&
            formCourse.courseName === row.courses[index].courseName &&
            formCourse.theoryTime === row.courses[index].theoryTime &&
            formCourse.practiceTime === row.courses[index].practiceTime &&
            formCourse.description === row.courses[index].description
          );
        }
      );

    // console.log(this.editProgramsReactiveForm.value);

    if (
      this.editProgramsReactiveForm.value.programCode == row.programCode &&
      this.editProgramsReactiveForm.value.programName == row.programName &&
      this.editProgramsReactiveForm.value.theoryTime == row.theoryTime &&
      this.editProgramsReactiveForm.value.practiceTime == row.practiceTime &&
      this.editProgramsReactiveForm.value.description == row.description &&
      areAllCoursesEqual
    ) {
      // console.log('im out');
      this.cancelEditing();
      return;
    }

    if (this.editProgramsReactiveForm.valid) {
      console.log(this.editProgramsReactiveForm.value);
      this.programService
        .editPrograms(row.programId, this.editProgramsReactiveForm.value)
        .subscribe({
          next: (data) => {
            // console.log(data);
            this.editingRowID = null;
            this.getProgramsList();
          },
          error: (error) => {
            console.log(error);
          },
        });
    }
  }

  cancelEditing() {
    this.editingRowID = null;
    this.editProgramsReactiveForm.reset();
  }

  lettersTypedDesc: number = 0;
  onInputChange(event: any) {
    this.lettersTypedDesc = event.target.value.length;
  }

  getRemainingCoursesWithNumbers(courses: any[]): string {
    const remainingCourses = courses.slice(2);
    // console.log(remainingCourses);
    return remainingCourses
      .map((course: any, index: any) => `${index + 1}. ${course.courseName}`)
      .join('\n');
  }
}
