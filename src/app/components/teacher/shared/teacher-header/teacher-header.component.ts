import { Component, OnInit } from '@angular/core';
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
export class TeacherHeaderComponent implements OnInit {
  constructor(private router: Router) {}

  teacherId: number = -1;
  teacherName: string = '';
  ngOnInit(): void {
    this.getTeacherDetails();
  }

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

  getTeacherDetails() {
    const storedTeacherDetails = localStorage.getItem('teacherDetails');
    if (storedTeacherDetails) {
      // Parse the JSON string back into an object
      const teacherDetails = JSON.parse(storedTeacherDetails);

      // access the properties
      this.teacherId = teacherDetails.teacherId;
      this.teacherName = teacherDetails.username;

      console.log(this.teacherId);
      console.log(this.teacherName);
    } else {
      console.log('No teacher details found in localStorage');
    }
  }
}
