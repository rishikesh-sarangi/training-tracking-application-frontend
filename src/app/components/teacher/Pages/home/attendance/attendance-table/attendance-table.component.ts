import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, Observable, Subject, takeUntil, tap } from 'rxjs';
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
export class AttendanceTableComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'actions',
    'topicName',
    'topicPercentageCompleted',
  ];

  dataSource!: MatTableDataSource<any>;

  studentAttendance: { [key: number]: boolean } = {};

  // @Input() enabledTable!: boolean;
  isLoading: boolean = false;
  errorMessage: string = '';
  showTableBasedOnFilter: boolean = false;

  @Input() set filterPayload(value: any) {
    if (value && Object.keys(value).length > 0) {
      this._filterPayload = value;
      this.fetchData();
    }
  }
  get filterPayload(): any {
    return this._filterPayload;
  }
  private _filterPayload: any = {};

  isAttendanceAvailable: boolean = false;

  expandedRowTable: any = null;

  isMarkAttendanceOpen: boolean = true;

  teacherId: number = -1;
  teacherName: string = '';

  editingRowID: number = -1;

  attendanceReactiveForm!: FormGroup;

  isMarkStudentsClicked: boolean = false;

  students: any[] = [];

  topics: any[] = [];

  private destroy$ = new Subject<void>();
  private dataFetchInProgress = false;

  constructor(
    private attendanceService: AttendanceService,
    private studentService: StudentTableService,
    private _dialog: MatDialog,
    private topicService: TopicsTableDataService,
    private snackBar: MatSnackBar
  ) {}
  ngOnInit(): void {
    this.fetchStudents();

    this.getStudentsByBatchIdAndProgramId(
      this.filterPayload.batchId,
      this.filterPayload.programId
    );

    // console.log(this.filterPayload);
    this.attendanceReactiveForm = new FormGroup({
      topicName: new FormControl(null, Validators.required),
      topicPercentageCompleted: new FormControl(null, Validators.required),
    });
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['filterPayload'] && !changes['filterPayload'].firstChange) {
  //     this.fetchData();
  //   }
  // }

  fetchData() {
    this.isLoading = true;
    this.fetchStudents(); // Always fetch students

    this.attendanceService
      .getAttendanceByFilter(this.filterPayload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.data && response.data.length > 0) {
            // Filter the data to include only entries where topicId, topicName, and topicPercentageComplete are not null
            const filteredData = response.data.filter(
              (item: any) =>
                item.topic !== null &&
                item.topicName !== null &&
                item.topicPercentageComplete !== null
            );

            this.dataSource = new MatTableDataSource(filteredData);
            this.isAttendanceAvailable = filteredData.length > 0;
          } else {
            this.isAttendanceAvailable = false;
            this.dataSource = new MatTableDataSource();
          }
          this.isLoading = false;
          this.fetchExistingAttendance();
        },
        error: (error) => {
          // this.snackBar.open('No attendance available', 'Close', {
          //   duration: 3000,
          // });
          console.log(error);
          this.isAttendanceAvailable = false;
          this.dataSource = new MatTableDataSource();
          this.isLoading = false;
        },
      });
  }

  getAttendance() {
    const payload = { ...this.filterPayload };

    // Adjust the date
    if (payload.attendanceDate) {
      const date = new Date(payload.attendanceDate);
      payload.attendanceDate = date.toISOString().split('T')[0];
    }

    // console.log(payload);

    this.attendanceService.getAttendanceByFilter(payload).subscribe({
      next: (response: any) => {
        // console.log('Fetched data for date:', payload.attendanceDate);
        console.log(response);

        if (response.data && response.data.length > 0) {
          const filteredData = response.data.filter(
            (item: any) =>
              item.topic !== null &&
              item.topicName !== null &&
              item.topicPercentageComplete !== null
          );

          this.dataSource = new MatTableDataSource(filteredData);
          this.isAttendanceAvailable = filteredData.length > 0;
        } else {
          this.isAttendanceAvailable = false;
          this.dataSource = new MatTableDataSource();
        }
        this.fetchStudents();
        this.fetchExistingAttendance();
      },
      error: (error) => {
        // this.snackBar.open('No attendance available', 'Close', {
        //   duration: 3000,
        // });
        console.log(error);
        this.isAttendanceAvailable = false;
        this.dataSource = new MatTableDataSource(); // Empty data source
        this.fetchStudents();
      },
    });
  }

  getUniqueTopics(currentTopicName: string): Observable<any[]> {
    return this.topicService
      .getTopicByCourseId(this.filterPayload.courseId)
      .pipe(
        map((topics: any[]) => {
          // Get all topic names currently in the table
          const existingTopicNames = this.dataSource.data
            .map((item) => item.topicName)
            .filter((name) => name !== currentTopicName); // Exclude the current topic being edited

          // Filter out topics that are already in the table
          return topics.filter(
            (topic) => !existingTopicNames.includes(topic.topicName)
          );
        }),
        tap((filteredTopics: any[]) => {
          this.topics = filteredTopics;
        })
      );
  }

  fetchExistingAttendance() {
    if (this.filterPayload.attendanceDate && this.filterPayload.batchId) {
    }
  }

  onAttendanceChange(studentId: number, isPresent: boolean) {
    this.studentAttendance[studentId] = isPresent;
  }

  saveStudentAttendance() {
    // First, create or get the attendance record for this day
    const attendancePayload = {
      attendanceDate: new Date(this.filterPayload.attendanceDate)
        .toISOString()
        .split('T')[0],
      batch: { batchId: this.filterPayload.batchId },
      program: { programId: this.filterPayload.programId },
      course: { courseId: this.filterPayload.courseId },
      teacher: { teacherId: this.filterPayload.teacherId },
      topic: null,
      topicName: null,
      topicPercentageCompleted: null,
    };

    // console.log(attendancePayload);

    this.attendanceService.createOrGetAttendance(attendancePayload).subscribe({
      next: (attendanceResponse) => {
        // console.log(attendanceResponse.data[0].attendanceDate);
        const attendanceRecords = this.students.map((student) => ({
          student: { studentId: student.studentId },
          attendance: { attendanceId: attendanceResponse.data[0].attendanceId },
          attendanceSecured: this.studentAttendance[student.studentId] || false,
        }));

        // console.log(attendanceRecords);

        this.attendanceService
          .saveAttendanceForStudents(attendanceRecords)
          .subscribe({
            next: () => {
              this.snackBar.open('Attendance saved successfully', 'Close', {
                duration: 3000,
              });
              this.isMarkAttendanceOpen = false;
            },
            error: (error) => {
              console.error('Error saving attendance:', error);
              this.snackBar.open('Error saving attendance', 'Close', {
                duration: 3000,
              });
            },
          });
      },
      error: (error) => {
        console.error('Error creating/getting attendance:', error);
        this.snackBar.open('Error saving attendance', 'Close', {
          duration: 3000,
        });
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

  fetchStudents() {
    if (this.filterPayload.batchId && this.filterPayload.programId) {
      this.studentService
        .getStudentsByBatchAndProgram(
          this.filterPayload.batchId,
          this.filterPayload.programId
        )
        .subscribe({
          next: (data) => {
            this.students = data;
            // console.log('Fetched students:', this.students);
          },
          error: (error) => {
            console.error('Error fetching students:', error);
          },
        });
    }
  }

  getTopics(): Observable<any> {
    return this.topicService
      .getTopicByCourseId(this.filterPayload.courseId)
      .pipe(
        tap((data: any) => {
          this.topics = data;
        })
      );
  }
  saveAttendance(row: any) {
    if (this.attendanceReactiveForm.valid) {
      const payload = {
        topicName: this.attendanceReactiveForm.value.topicName.topicName,
        topicPercentageCompleted:
          this.attendanceReactiveForm.value.topicPercentageCompleted,
        topicId: this.attendanceReactiveForm.value.topicName.topicId,
      };
      this.attendanceService
        .updateAttendance(row.attendanceId, payload)
        .subscribe({
          next: (data) => {
            this.editingRowID = -1;
            this.attendanceReactiveForm.reset();
            this.getAttendance(); // Refresh the table data
          },
          error: (error) => {
            console.error('Error updating attendance:', error);
            // Handle error (e.g., show an error message)
          },
        });
    }
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
      // Explicit close action
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

  editAttendance(row: any) {
    this.editingRowID = row.attendanceId;
    this.getUniqueTopics(row.topicName).subscribe(() => {
      const selectedTopic = this.topics.find(
        (topic) => topic.topicName === row.topicName
      );

      this.attendanceReactiveForm.patchValue({
        topicName: selectedTopic || null,
        topicPercentageCompleted: row.topicPercentageCompleted,
      });
    });
  }

  cancelEditing() {
    this.editingRowID = -1; // or any value that doesn't match an attendanceId
    this.attendanceReactiveForm.reset();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
