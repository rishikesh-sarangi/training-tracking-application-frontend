import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
@Component({
  selector: 'app-teacher-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule],
  templateUrl: './teacher-header.component.html',
  styleUrls: ['./teacher-header.component.scss'],
})
export class TeacherHeaderComponent {
  constructor(private router: Router) {}

  // course-programs toggle
  selectedTab: string = 'Courses';

  protected logOut() {
    localStorage.clear();
    this.router.navigate(['']);
  }

  protected toggleCoursePrograms(selectedTabBool: boolean) {
    selectedTabBool
      ? (this.selectedTab = 'Courses')
      : (this.selectedTab = 'Programs');
  }
}
