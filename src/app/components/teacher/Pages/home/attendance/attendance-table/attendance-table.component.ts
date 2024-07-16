import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { NgFor } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  NgForm,
  FormsModule,
} from '@angular/forms';
import { AttendanceService } from 'src/app/components/teacher/shared/Services/attendance.service';
import { MatTableDataSource } from '@angular/material/table';
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
  @Input() parentFormData!: any;
  @Input() enabledTable!: boolean;

  topics: string[] = ['Topic 1', 'Topic 2', 'Topic 3'];

  attendanceReactiveForm!: FormGroup;

  constructor(private attendanceService: AttendanceService) {}
  ngOnInit(): void {
    this.getAttendance();
    this.attendanceReactiveForm = new FormGroup({
      topicName: new FormControl(null, Validators.required),
      topicPercentageCompleted: new FormControl(null, Validators.required),
    });
  }

  onSubmit() {
    if (this.attendanceReactiveForm.valid) {
      const totalPayload = {
        ...this.parentFormData,
        ...this.attendanceReactiveForm.value,
      };
      this.attendanceService.addAttendance(totalPayload).subscribe({
        next: () => {
          this.parentFormData = null;
          this.enabledTable = false;
        },
      });
    }
  }

  getAttendance() {
    this.attendanceService.getAttendances().subscribe({
      next: (data: any) => {
        this.dataSource = new MatTableDataSource(data);
      },
    });
  }

  closeForm() {
    this.attendanceReactiveForm.reset();
    this.parentFormData = null;
    this.enabledTable = false;
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

  students: string[] = ['Student 1', 'Student 2', 'Student 3', 'Student 4'];
}
