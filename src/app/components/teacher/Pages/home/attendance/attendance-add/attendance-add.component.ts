import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
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
  tableTopics: any = [];
  @Input() parentPayload: any = {};
  @Input() openAttendanceForm: boolean = false;
  @Output() closeAssignmentForm = new EventEmitter<boolean>();
  @Output() attendanceAdded = new EventEmitter<void>();

  constructor(
    private topicService: TopicsTableDataService,
    private attendanceService: AttendanceService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getTopics();
    this.initForm();
  }
  topicCompletionInfo: Map<
    number,
    { percentage: number; name: string; date: Date }
  > = new Map();
  initForm(): void {
    this.attendanceReactiveForm = new FormGroup({
      topic: new FormControl(null, Validators.required),
      topicPercentageCompleted: new FormControl(null, [
        Validators.required,
        Validators.min(0),
        Validators.max(100),
        this.minPercentageValidator.bind(this),
        this.datePercentageValidator.bind(this),
      ]),
    });

    // Add valueChanges listener to topic control
    this.attendanceReactiveForm
      .get('topic')
      ?.valueChanges.subscribe((topic) => {
        if (topic) {
          this.attendanceReactiveForm
            .get('topicPercentageCompleted')
            ?.updateValueAndValidity();
        }
      });

    // Add valueChanges listener to topic control
    this.attendanceReactiveForm
      .get('topic')
      ?.valueChanges.subscribe((topic) => {
        if (topic) {
          const minPercentage =
            this.topicCompletionInfo.get(topic.topicId)?.percentage || 0;
          this.attendanceReactiveForm
            .get('topicPercentageCompleted')
            ?.updateValueAndValidity();
        }
      });
  }

  minPercentageValidator(control: FormControl): { [key: string]: any } | null {
    const topic = this.attendanceReactiveForm?.get('topic')?.value;
    if (topic) {
      const minPercentage =
        this.topicCompletionInfo.get(topic.topicId)?.percentage || 0;
      const enteredPercentage = control.value;
      if (enteredPercentage < minPercentage) {
        return {
          minPercentage: { min: minPercentage, actual: enteredPercentage },
        };
      }
    }
    return null;
  }

  datePercentageValidator(control: FormControl): { [key: string]: any } | null {
    const topic = this.attendanceReactiveForm?.get('topic')?.value;
    if (topic) {
      const topicInfo = this.topicCompletionInfo.get(topic.topicId);
      if (topicInfo) {
        const currentDate = new Date(this.parentPayload.attendanceDate);
        const existingDate = new Date(topicInfo.date);
        const enteredPercentage = control.value;

        if (
          currentDate < existingDate &&
          enteredPercentage > topicInfo.percentage
        ) {
          return {
            invalidDatePercentage: {
              maxPercentage: topicInfo.percentage,
              date: existingDate,
            },
          };
        }
      }
    }
    return null;
  }

  onSubmit() {
    if (this.attendanceReactiveForm.valid) {
      const totalPayload = {
        teacher: { teacherId: this.parentPayload.teacherId },
        program: { programId: this.parentPayload.programId },
        course: { courseId: this.parentPayload.courseId },
        batch: { batchId: this.parentPayload.batchId },
        topicName: this.attendanceReactiveForm.value.topic.topicName,
        topicPercentageCompleted:
          this.attendanceReactiveForm.value.topicPercentageCompleted,
        attendanceDate: new Date(this.parentPayload.attendanceDate)
          .toISOString()
          .split('T')[0],
        topic: { topicId: this.attendanceReactiveForm.value.topic.topicId },
      };

      // console.log(totalPayload);

      this.attendanceService.addAttendance(totalPayload).subscribe({
        next: () => {
          this.attendanceReactiveForm.reset();
          this.closeForm();
          // Emit an event to refresh the table
          this.attendanceAdded.emit();
        },
        error: (error) => {
          console.error('Error adding attendance:', error);
          // Handle error (show message to user)
        },
      });
    }
  }

  getAttendanceInTable() {
    this.attendanceService.getAttendanceByFilter(this.parentPayload).subscribe({
      next: (response: any) => {
        // console.log(response);
        for (const obj of response.data) {
          // console.log('Response', obj);
          this.tableTopics.push(obj.topic);
        }

        // console.log(this.tableTopics);
      },
      error: (error) => {
        this.tableTopics = [];
      },
    });
  }

  getTopics() {
    if (this.parentPayload && this.parentPayload.courseId) {
      // Map to store completion information
      this.topicCompletionInfo = new Map<
        number,
        { percentage: number; name: string; date: Date }
      >();

      // First, fetch all topics for the course
      this.topicService
        .getTopicByCourseId(this.parentPayload.courseId)
        .subscribe({
          next: (allTopics: any[]) => {
            // Store all topics
            this.topics = allTopics;

            // Now get the attendance data for the table
            this.attendanceService
              .getAttendanceByFilter(this.parentPayload)
              .subscribe({
                next: (tableResponse: any) => {
                  this.tableTopics = tableResponse.data
                    .map((obj: any) => obj.topic)
                    .filter(Boolean);
                  this.processAttendanceData();
                },
                error: (error) => {
                  console.error('Error fetching table attendance data:', error);
                  this.tableTopics = [];
                  // If there's no current table data, process all topics
                  this.processAttendanceData();
                },
              });
          },
          error: (error) => {
            console.error('Error fetching topics:', error);
          },
        });
    }
  }

  private processAttendanceData() {
    // First, get the topics already in the table
    const tableTopicIds = new Set(
      this.tableTopics.map((topic: any) => topic.topicId)
    );

    this.attendanceService
      .getAttendanceByCourseFilter(this.parentPayload)
      .subscribe({
        next: (courseResponse: any) => {
          // Process the course attendance data
          courseResponse.data.forEach((attendance: any) => {
            if (
              attendance.topic &&
              attendance.topicPercentageCompleted !== null
            ) {
              const topicId = attendance.topic.topicId;
              const percentage = attendance.topicPercentageCompleted;
              const name = attendance.topicName;
              const date = new Date(attendance.attendanceDate);

              if (
                !this.topicCompletionInfo.has(topicId) ||
                percentage > this.topicCompletionInfo.get(topicId)!.percentage
              ) {
                this.topicCompletionInfo.set(topicId, {
                  percentage,
                  name,
                  date,
                });
              }
            }
          });

          // Filter topics based on completion percentage and table presence
          this.topics = this.topics.filter((topic) => {
            const topicData = this.topicCompletionInfo.get(topic.topicId);
            return (
              !tableTopicIds.has(topic.topicId) && // Exclude topics already in the table
              (!topicData || topicData.percentage < 100) // Exclude topics completed 100%
            );
          });

          console.log('Filtered topics:', this.topics);
          console.log('Topic completion info:', this.topicCompletionInfo);

          // Trigger change detection
          this.changeDetectorRef.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching course attendance data:', error);
          // If there's an error, we filter out only the topics in the table
          this.topics = this.topics.filter(
            (topic) => !tableTopicIds.has(topic.topicId)
          );
          console.log('Filtered topics based only on table data due to error');
          this.changeDetectorRef.detectChanges();
        },
      });
  }
  closeForm() {
    this.openAttendanceForm = false;
    this.closeAssignmentForm.emit();
  }
}
