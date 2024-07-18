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
})
export class AttendanceTableComponent implements OnInit {
  displayedColumns: string[] = [
    'actions',
    'topicName',
    'topicPercentageCompleted',
  ];

  dataSource!: MatTableDataSource<any>;
  // parent payload
  @Input() parentPayload!: any;
  // @Input() enabledTable!: boolean;
  isLoading: boolean = false;
  errorMessage: string = '';

  students: any[] = [];
  topics: any[] = [];

  attendanceReactiveForm!: FormGroup;

  constructor(
    private attendanceService: AttendanceService,
    private topicService: TopicsTableDataService
  ) {}
  ngOnInit(): void {
    // console.log(this.parentPayload);
    this.getTopics();

    // this.getAttendance();
    this.attendanceReactiveForm = new FormGroup({
      topic: new FormControl(null, Validators.required),
      topicPercentageCompleted: new FormControl(null, Validators.required),
    });
  }

  onSubmit() {
    if (this.attendanceReactiveForm.valid) {
      const totalPayload = {
        teacher: { teacherId: this.parentPayload.teacherId },
        program: { programId: this.parentPayload.programId },
        course: { courseId: this.parentPayload.courseId },
        batch: { batchId: this.parentPayload.batchId },
        evaluationDate: this.parentPayload.evaluationDate,
        topicName: this.attendanceReactiveForm.value.topic.topicName,
        topicPercentageCompleted:
          this.attendanceReactiveForm.value.topicPercentageCompleted,
        attendanceDate: this.parentPayload.attendanceDate,
        topic: { topicId: this.attendanceReactiveForm.value.topic.topicId },
      };

      // console.log(totalPayload);

      this.attendanceService.addAttendance(totalPayload).subscribe({
        next: () => {
          this.attendanceReactiveForm.reset();
          this.parentPayload = null;
        },
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parentPayload'] && !changes['parentPayload'].firstChange) {
      console.log('Parent payload changed:', this.parentPayload);
      this.initializeData();
    }
  }

  initializeData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.getTopics();
  }

  getAttendance() {
    // this.attendanceService.getAttendances().subscribe({
    //   next: (data: any) => {
    //     this.dataSource = new MatTableDataSource(data);
    //   },
    // });
  }

  getTopics() {
    if (this.parentPayload && this.parentPayload.courseId) {
      this.topicService
        .getTopicByCourseId(this.parentPayload.courseId)
        .subscribe({
          next: (data: any) => {
            this.topics = data;
            this.isLoading = false;
            console.log(this.topics);
          },
          error: (error) => {
            console.error('Error fetching topics:', error);
            this.errorMessage = 'Failed to load topics. Please try again.';
            this.isLoading = false;
          },
        });
    } else {
      this.isLoading = false;
    }
  }

  closeForm() {
    this.attendanceReactiveForm.reset();
    this.parentPayload = null;
  }

  // checkbox stuff
  allChecked = false;
  options = [
    { name: 'Option 1', checked: false },
    { name: 'Option 2', checked: false },
    { name: 'Option 3', checked: false },
    { name: 'Option 4', checked: false },
  ];

  toggleAll() {
    this.allChecked = !this.allChecked;
    this.options.forEach((option) => (option.checked = this.allChecked));
  }

  updateAllChecked() {
    this.allChecked = this.options.every((option) => option.checked);
  }
}
