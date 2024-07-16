import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { BatchesAndProgramsComponent } from './batches-and-programs/batches-and-programs.component';
import { AttendanceComponent } from './attendance/attendance.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    BatchesAndProgramsComponent,
    AttendanceComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {}
