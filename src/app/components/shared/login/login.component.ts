import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarModule,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import {
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../Services/login.service';
import { Credentials } from '../models/Credentials';
import { TeachersTableService } from '../Services/teachers-table.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private loginService: LoginService,
    private teacherService: TeachersTableService
  ) {}
  hide = true;

  // reactive forms
  loginForm!: FormGroup;

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
      ]),
    });
  }

  protected openSnackBar() {
    this.snackBar.open('Login Invalid', 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      duration: 2000,
    });
  }

  protected onSubmit() {
    this.loginService.login(this.loginForm.value).subscribe({
      next: (data: Credentials) => {
        if (data.userRole.toUpperCase() == 'ADMIN') {
          localStorage.setItem('loggedInSaveAdmin', 'true');
          localStorage.setItem('username', data.username);
          this.router.navigate(['admin/home/', 'courses']);
          return;
        }

        // For teacher role
        this.teacherService
          .getTeacherIdByTeacherEmail(this.loginForm.value.email)
          .subscribe({
            next: (teacherId) => {
              localStorage.setItem('loggedInSaveTeacher', 'true');

              const teacherDetails = {
                username: data.username,
                teacherId: teacherId,
              };

              localStorage.setItem(
                'teacherDetails',
                JSON.stringify(teacherDetails)
              );

              this.router.navigate(['teacher', 'home']);
            },
            error: (err) => {
              console.log('Error fetching teacher ID:', err);
              // Handle the error appropriately
            },
          });
      },
      error: (err) => {
        console.log('Login error:', err);
        // Handle login error
      },
    });
  }
}
