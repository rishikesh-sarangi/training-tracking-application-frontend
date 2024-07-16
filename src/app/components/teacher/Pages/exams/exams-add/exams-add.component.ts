import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  NgForm,
  FormsModule,
} from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { ExamsService } from '../../../shared/Services/exams.service';
import { AssignmentService } from '../../../shared/Services/assignment.service';
@Component({
  selector: 'app-exams-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './exams-add.component.html',
  styleUrls: ['./exams-add.component.scss'],
})
export class ExamsAddComponent {
  constructor(
    private examService: ExamsService,
    private assignmentService: AssignmentService
  ) {}

  @Input() openExamForm: boolean = false;
  @Input() parentPayload!: any;

  // reusing the component for assignments as well
  @Input() isAssignments: boolean = false;

  @Output() closeExamForm = new EventEmitter<boolean>();

  displayedColumns: string[] = [];

  setUpColumns() {
    if (this.isAssignments) {
      this.displayedColumns = [
        'actions',
        'assignmentName',
        'totalMarks',
        'assignmentDate',
        'assignmentTime',
        'uploadFile',
      ];
    } else {
      this.displayedColumns = [
        'actions',
        'examName',
        'totalMarks',
        'examDate',
        'examTime',
        'uploadFile',
      ];
    }
  }

  sharedReactiveForm!: FormGroup;

  ngOnInit(): void {
    this.setUpColumns();
    // console.log(this.displayedColumns);
    this.sharedReactiveForm = new FormGroup({
      [this.isAssignments ? 'assignmentName' : 'examName']: new FormControl(
        null,
        [
          Validators.required,
          Validators.pattern(/^[\S]+(\s+[\S]+)*$/), // regex for no whitespace
        ]
      ),
      totalMarks: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^[0-9]+$/), // regex for numbers only
      ]),
      [this.isAssignments ? 'assignmentDate' : 'examDate']: new FormControl(
        null,
        [Validators.required, Validators.pattern(/^[\S]+(\s+[\S]+)*$/)]
      ),
      [this.isAssignments ? 'assignmentTime' : 'examTime']: new FormControl(
        null,
        [Validators.required, Validators.pattern(/^[\S]+(\s+[\S]+)*$/)]
      ),
      uploadFile: new FormControl(null),
    });
  }
  onSubmit() {
    if (this.sharedReactiveForm.valid) {
      // this.timeConverter(
      //   this.sharedReactiveForm.get(
      //     this.isAssignments ? 'assignmentTime' : 'examTime'
      //   )?.value
      // );
      // console.log(this.parentPayload);
      const examPayload = {
        ...this.sharedReactiveForm.value,
        ...this.parentPayload,
      };
      // console.log(examPayload);

      // conditionally check if we are in assignments or exams and make the service call
      const serviceMethod = this.isAssignments
        ? this.assignmentService.addAssignments(examPayload)
        : this.examService.addExams(examPayload);

      serviceMethod.subscribe({
        next: (res) => {
          this.sharedReactiveForm.reset();
          this.closeForm();
          // console.log(res);
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  closeForm() {
    this.openExamForm = !this.openExamForm;
    this.closeExamForm.emit(this.openExamForm);
    this.sharedReactiveForm.reset();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    console.log(file);
  }

  // timeConverter(time: string) {
  //   const timeString = this.isAssignments
  //     ? this.sharedReactiveForm.get('assignmentTime')?.value
  //     : this.sharedReactiveForm.get('examTime')?.value;

  //   const [hours, minutes] = timeString.split(':');
  //   const hoursNum = parseInt(hours, 10);

  //   let period = 'AM';
  //   let hoursConverted = hoursNum;

  //   if (hoursNum === 0) {
  //     hoursConverted = 12;
  //   } else if (hoursNum === 12) {
  //     period = 'PM';
  //   } else if (hoursNum > 12) {
  //     hoursConverted = hoursNum - 12;
  //     period = 'PM';
  //   }

  //   const formattedHours = hoursConverted.toString().padStart(2, '0');
  //   const formattedMinutes = minutes.padStart(2, '0');

  //   this.sharedReactiveForm
  //     .get(this.isAssignments ? 'assignmentTime' : 'examTime')
  //     ?.setValue(`${formattedHours}:${formattedMinutes} ${period}`);
  // }
}
