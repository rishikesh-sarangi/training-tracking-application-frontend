import { Component, OnInit } from '@angular/core';
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
import { CourseTableDataService } from '../../../../shared/Services/course-table-data.service';
import { ProgramsTableService } from '../../../../shared/Services/programs-table.service';
import { ProgramsTableComponent } from './programs-table/programs-table.component';
import { noWhitespaceValidator } from 'src/app/components/shared/Validators/NoWhiteSpaceValidator';
@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    ProgramsTableComponent,
  ],
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.scss'],
})
export class ProgramsComponent implements OnInit {
  constructor(
    private courseTableData: CourseTableDataService,
    private programService: ProgramsTableService
  ) {}

  isAddProgramsClicked: boolean = false;
  lettersTypedDesc: number = 0;
  isDescOpen: boolean = false;
  addProgramsReactiveForm!: FormGroup;
  courses: any[] = [];

  displayedColumns: string[] = [
    'actions',
    'programCode',
    'programName',
    'theoryTime',
    'practiceTime',
    'description',
    'course',
  ];

  ngOnInit(): void {
    this.getCourses();
    this.addProgramsReactiveForm = new FormGroup({
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
      courses: new FormControl(null, Validators.required),
    });
  }

  onInputChange(event: any) {
    this.lettersTypedDesc = event.target.value.length;
    return;
  }

  onSubmit() {
    // console.log(this.addProgramsReactiveForm.value);
    if (this.addProgramsReactiveForm.valid) {
      // console.log(this.addProgramsReactiveForm.value);
      this.programService
        .addPrograms(this.addProgramsReactiveForm.value)
        .subscribe({
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

  getCourses() {
    this.courseTableData.getCourses().subscribe({
      next: (data) => {
        // console.log(data);
        this.courses = data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  closeForm() {
    this.addProgramsReactiveForm.reset();
    this.isAddProgramsClicked = !this.isAddProgramsClicked;
  }

  // Search Filter
  SearchValue: string = '';
  onSearchChange(event: any) {
    this.SearchValue = (event.target as HTMLInputElement).value;
  }

  $clickEvent!: any;
  refresh($event: any) {
    this.$clickEvent = $event;
    // console.log('parent clicked');
  }
}
