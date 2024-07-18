import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { NgFor } from '@angular/common';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { AttendanceService } from 'src/app/components/teacher/shared/Services/attendance.service';
import { MatTableDataSource } from '@angular/material/table';
import { TopicsTableDataService } from 'src/app/components/shared/Services/topics-table-data.service';
import { StudentTableService } from 'src/app/components/shared/Services/student-table.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogueComponent } from 'src/app/components/shared/delete-dialogue/delete-dialogue.component';
@Component({
  selector: 'app-attendance-table',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    NgFor,
  ],
  templateUrl: './attendance-table.component.html',
  styleUrls: ['./attendance-table.component.scss'],
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
export class AttendanceTableComponent implements OnInit {
  displayedColumns: string[] = [
    'actions',
    'topicName',
    'topicPercentageCompleted',
  ];

  dataSource!: MatTableDataSource<any>;
  // @Input() enabledTable!: boolean;
  isLoading: boolean = false;
  errorMessage: string = '';
  showTableBasedOnFilter: boolean = false;
  @Input() filterPayload: any = {};

  isAttendanceAvailable: boolean = false;

  expandedRowTable: any = null;

  teacherId: number = -1;
  teacherName: string = '';

  editingRowID: number = -1;

  attendanceReactiveForm!: FormGroup;

  isMarkStudentsClicked: boolean = false;

  students: any[] = [];

  constructor(
    private attendanceService: AttendanceService,
    private studentService: StudentTableService,
    private _dialog: MatDialog
  ) {}
  ngOnInit(): void {
    this.getAttendance();
    // console.log(this.parentPayload);
    this.attendanceReactiveForm = new FormGroup({
      topicName: new FormControl(null, Validators.required),
      topicPercentageCompleted: new FormControl(null, Validators.required),
    });
  }

  getAttendance() {
    this.attendanceService.getAttendanceByFilter(this.filterPayload).subscribe({
      next: (response: any) => {
        // console.log(data);
        this.dataSource = new MatTableDataSource(response[0].data);
        if (this.isAttendanceAvailable) {
          this.isAttendanceAvailable = false;
        } else {
          this.isAttendanceAvailable = true;
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  getTeacherDetails() {
    const storedTeacherDetails = localStorage.getItem('teacherDetails');
    if (storedTeacherDetails) {
      // Parse the JSON string back into an object
      const teacherDetails = JSON.parse(storedTeacherDetails);

      // access the properties
      this.teacherId = teacherDetails.teacherId;
      this.teacherName = teacherDetails.username;

      // console.log(this.teacherId);
      // console.log(this.teacherName);
    } else {
      console.log('No teacher details found in localStorage');
    }
  }

  getStudentsByBatchIdAndProgramId(batchId: number, programId: number) {
    this.studentService
      .getStudentsByBatchAndProgram(batchId, programId)
      .subscribe({
        next: (data) => {
          this.students = data;
        },
      });
  }

  saveAttendance(row: any) {
    // this.editingRowID = -1;
    // this.attendanceReactiveForm.reset();
    // this.getAttendance();
  }

  deleteAttendance(row: any) {
    const dialogRef = this._dialog.open(DeleteDialogueComponent, {
      data: {
        targetTopicNameInAttendance: row.topicName,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.attendanceService
          .deleteAttendance(row.attendanceId)
          .subscribe((data) => {
            this.getAttendance();
          });
      }
    });
  }

  toggleTable(row: any) {
    if (this.expandedRowTable === row) {
      // Closing the expanded row
      this.expandedRowTable = null;
      this.isMarkStudentsClicked = false; // Reset the flag when closing
    } else if (row === null) {
      // Explicit close action (e.g., from a close button)
      this.expandedRowTable = null;
      this.isMarkStudentsClicked = false; // Reset the flag when explicitly closing
    } else {
      // Opening a new row
      this.expandedRowTable = row;
      this.isMarkStudentsClicked = true; // Set the flag when opening
      this.getStudentsByBatchIdAndProgramId(
        row.batch.batchId,
        row.program.programId
      );
    }
  }

  editAttendance(id: number, row: any) {
    this.editingRowID = id;
    this.attendanceReactiveForm.patchValue(row);
  }

  cancelEditing() {
    this.editingRowID = -1;
    this.attendanceReactiveForm.reset();
  }
}
