import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/shared/login/login.component';
import { HeaderComponent } from './components/admin/shared/header/header.component';
import {
  authGuardAdmin,
  authGuardTeacher,
} from './components/shared/guards/auth.guard';
import { CoursesComponent } from './components/admin/Pages/courses-programs/courses/courses.component';
import { BatchComponent } from './components/admin/Pages/batch/batch.component';
import { TeachersComponent } from './components/admin/Pages/teachers/teachers.component';
import { StudentsComponent } from './components/admin/Pages/students/students.component';
import { TopicsComponent } from './components/admin/Pages/courses-programs/courses/topics/topics.component';
import { ProgramsComponent } from './components/admin/Pages/courses-programs/programs/programs.component';
import { HomeComponent } from './components/teacher/Pages/home/home.component';
import { TeacherHeaderComponent } from './components/teacher/shared/teacher-header/teacher-header.component';
import { ExamsComponent } from './components/teacher/Pages/exams/exams.component';
import { AssignmentsComponent } from './components/teacher/Pages/assignments/assignments.component';
import { ReportsComponent } from './components/teacher/Pages/reports/reports.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'admin/home',
    component: HeaderComponent,
    canActivate: [authGuardAdmin],
    children: [
      { path: 'courses', component: CoursesComponent },
      { path: 'programs', component: ProgramsComponent },
      { path: 'batch', component: BatchComponent },
      { path: 'teachers', component: TeachersComponent },
      { path: 'students', component: StudentsComponent },
      { path: 'topics/:topicCode', component: TopicsComponent },
    ],
  },
  {
    path: 'teacher',
    component: TeacherHeaderComponent,
    canActivate: [authGuardTeacher],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'exams', component: ExamsComponent },
      { path: 'assignments', component: AssignmentsComponent },
      { path: 'reports', component: ReportsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
