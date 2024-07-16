import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamsComponent } from '../exams/exams.component';

@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [CommonModule, ExamsComponent],
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.scss'],
})
export class AssignmentsComponent implements OnInit {
  isAssignments: boolean = false;

  ngOnInit(): void {
    this.isAssignments = true;
  }
}
