import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  NgForm,
} from '@angular/forms';
import { CoursesTableComponent } from './courses-table/courses-table.component';
import { CourseTableDataService } from '../../../../shared/Services/course-table-data.service';
import { noWhitespaceValidator } from 'src/app/components/shared/Validators/NoWhiteSpaceValidator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatInputModule,
    MatTableModule,
    ReactiveFormsModule,
    MatMenuModule,
    OverlayModule,
    CoursesTableComponent,
    MatTooltipModule,
    MaterialModule,
  ],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss'],
})
export class CoursesComponent {
  constructor(
    private courseTableData: CourseTableDataService,
    private snackBar: MatSnackBar
  ) {}

  displayedColumns: string[] = [
    'actions',
    'code',
    'courseName',
    'theoryTime',
    'practiceTime',
    'description',
    'topics',
  ];
  protected isAddCourseClicked: boolean = false;

  // REACTIVE FORM
  protected addCourseReactiveForm!: FormGroup;

  ngOnInit(): void {
    this.addCourseReactiveForm = new FormGroup({
      code: new FormControl(null, [
        Validators.required,
        noWhitespaceValidator(),
        Validators.maxLength(10),
      ]),
      courseName: new FormControl(null, [
        Validators.required,
        noWhitespaceValidator(),
        Validators.maxLength(10),
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
    });
  }

  protected onSubmit() {
    // console.log(this.addCourseReactiveForm.value);
    if (this.addCourseReactiveForm.valid) {
      this.courseTableData
        .addCourse(this.addCourseReactiveForm.value)
        .subscribe({
          next: (data: any) => {
            // console.log(data);
            // add snackbar
            this.closeForm();
          },
          error: (err: any) => {
            // console.log(err);
            this.snackBar.open(err.error, 'Close', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 2000,
            });
          },
        });
    }
  }

  closeForm() {
    this.addCourseReactiveForm.reset();
    this.isAddCourseClicked = !this.isAddCourseClicked;
    // console.log('close form', this.isAddCourseClicked);
  }

  // logic for letters / 40 in desc
  protected isDescOpen = false;
  protected lettersTypedDesc: number = 0;
  protected onInputChange(event: any) {
    this.lettersTypedDesc = event.target.value.length;
    return;
  }

  // Search Filter
  SearchValue: string = '';
  onSearchChange(event: any) {
    this.SearchValue = (event.target as HTMLInputElement).value;
  }

  $clickEvent!: any;
  refresh($event: any) {
    window.location.reload();
    // console.log('parent clicked');
  }
}
