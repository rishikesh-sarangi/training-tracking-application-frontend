import { Component, Input, OnInit, ViewChild } from '@angular/core';
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
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AssignmentService } from '../../../shared/Services/assignment.service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogueComponent } from 'src/app/components/shared/delete-dialogue/delete-dialogue.component';
@Component({
  selector: 'app-exams-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './exams-table.component.html',
  styleUrls: ['./exams-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0px' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class ExamsTableComponent implements OnInit {
  constructor(
    private examService: ExamsService,
    private assignmentService: AssignmentService,
    private _dialog: MatDialog
  ) {}

  @Input() isAssignments: boolean = false;

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

  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatSort) sort!: MatSort;

  editingRowID: number = -1;

  students: string[] = [
    'Rishikesh Sarangi',
    'Ateek Gautam',
    'Harshdeep Singh',
    'Nikita Dubey',
  ];

  sharedReactiveForm!: FormGroup;

  ngOnInit(): void {
    this.setUpColumns();
    this.getSharedDetails();

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

  getSharedDetails() {
    const serviceMethod = this.isAssignments
      ? this.assignmentService.getAssignments()
      : this.examService.getExams();

    serviceMethod.subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.sort = this.sort;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  editSharedData(id: number, row: any) {
    this.editingRowID = id;
    this.sharedReactiveForm.patchValue(row);
  }

  deleteSharedData(row: any) {
    const dialogRef = this._dialog.open(DeleteDialogueComponent, {
      data: {
        targetType: this.isAssignments ? 'assignment' : 'exam',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const serviceMethod = this.isAssignments
          ? this.assignmentService.deleteAssignments(row.id)
          : this.examService.deleteExams(row.id);

        serviceMethod.subscribe({
          next: (data) => {
            this.getSharedDetails();
          },
          error: (err) => {
            console.log(err);
          },
        });
      }
    });
  }

  saveSharedData(row: any) {
    if (this.sharedReactiveForm.valid) {
      // console.log(this.sharedReactiveForm.get('assignmentTime')?.value);

      // this.timeConverter(
      //   this.sharedReactiveForm.get(
      //     this.isAssignments ? 'assignmentTime' : 'examTime'
      //   )?.value
      // );

      const serviceMethod = this.isAssignments
        ? this.assignmentService.editAssignments(
            row.id,
            this.sharedReactiveForm.value
          )
        : this.examService.editExams(row.id, this.sharedReactiveForm.value);

      serviceMethod.subscribe({
        next: (data) => {
          this.cancelEditing();
          this.getSharedDetails();
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
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

  cancelEditing() {
    this.editingRowID = -1;
    this.sharedReactiveForm.reset();
  }

  expandedRowTable: any = null;
  isMarkStudentsClicked: boolean = false;

  toggleTable(row: any) {
    this.expandedRowTable = this.expandedRowTable == row ? null : row;
    this.isMarkStudentsClicked = !this.isMarkStudentsClicked;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    // console.log(file);
  }
}
