import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TopicsTableDataService } from 'src/app/components/shared/Services/topics-table-data.service';
import { AttendanceService } from 'src/app/components/teacher/shared/Services/attendance.service';

@Component({
  selector: 'app-attendance-add',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, FormsModule],
  templateUrl: './attendance-add.component.html',
  styleUrls: ['./attendance-add.component.scss'],
})
export class AttendanceAddComponent implements OnInit {
  displayedColumns: string[] = [
    'actions',
    'topicName',
    'topicPercentageCompleted',
  ];
  attendanceReactiveForm!: FormGroup;
  students: any[] = [];
  topics: any[] = [];

  @Input() parentPayload: any = {};
  @Input() openAttendanceForm: boolean = false;
  @Output() closeAssignmentForm = new EventEmitter<boolean>();

  constructor(
    private topicService: TopicsTableDataService,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit(): void {
    this.getTopics();
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

      if (totalPayload.attendanceDate) {
        const date = new Date(totalPayload.attendanceDate);
        date.setDate(date.getDate() + 1);
        totalPayload.attendanceDate = date.toISOString().split('T')[0];
      }
      // console.log(totalPayload);

      this.attendanceService.addAttendance(totalPayload).subscribe({
        next: () => {
          this.attendanceReactiveForm.reset();
          this.closeForm();
        },
      });
    }
  }

  getTopics() {
    if (this.parentPayload && this.parentPayload.courseId) {
      this.topicService
        .getTopicByCourseId(this.parentPayload.courseId)
        .subscribe({
          next: (data: any) => {
            this.topics = data;
            // console.log(this.topics);
          },
          error: (error) => {
            console.error('Error fetching topics:', error);
          },
        });
    }
  }

  closeForm() {
    this.openAttendanceForm = !this.openAttendanceForm;
    this.closeAssignmentForm.emit(this.openAttendanceForm);
    this.attendanceReactiveForm.reset();
  }
}
