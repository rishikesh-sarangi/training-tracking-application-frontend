import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-user-added',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './user-added.component.html',
  styleUrls: ['./user-added.component.scss'],
})
export class UserAddedComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  targetTeacherName: string = this.data.targetTeacherName;
  targetStudentName: string = this.data.targetStudentName;
}
