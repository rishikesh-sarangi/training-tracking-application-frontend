import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialog,
  MatDialogRef,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { CoursesTableComponent } from '../../admin/Pages/courses-programs/courses/courses-table/courses-table.component';
import { CourseTableDataService } from 'src/app/components/shared/Services/course-table-data.service';

interface CourseData {
  targetCode: string;
  targetCourse: string;
  targetTopicName: string;
}

@Component({
  selector: 'app-delete-dialogue',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './delete-dialogue.component.html',
  styleUrls: ['./delete-dialogue.component.scss'],
})
export class DeleteDialogueComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  // courses delete
  targetCode: string = this.data.targetCode;
  targetCourse: string = this.data.targetCourse;

  // topic delete
  targetTopicName: string = this.data.targetTopicName;

  // programs delete
  targetProgramCode = this.data.targetProgramCode;
  targetProgramName = this.data.targetProgramName;

  // teacher delete
  targetTeacherName = this.data.targetTeacherName;

  // student delete
  targetStudentName = this.data.targetStudentName;

  // batch delete
  targetBatchCode = this.data.targetBatchCode;
  targetBatchName = this.data.targetBatchName;

  // batch programs delete
  targetBatchCode_programs = this.data.targetBatchCode_programs;
  targetBatchProgramName = this.data.targetBatchProgramName;
  targetBatchProgramCode = this.data.targetBatchProgramCode;

  // delete exams
  targetExamName = this.data.targetType;

  // delete assignments
  targetAssignmentName = this.data.targetType;
}
