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

  protected onSubmit() {
    this.loginService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log(response);
        if (response.data[0].userRole.toUpperCase() == 'ADMIN') {
          localStorage.setItem('loggedInSaveAdmin', 'true');
          localStorage.setItem('username', response.data[0].username);
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
                username: response.data[0].username,
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
        this.snackBar.open(err.error.message, 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
    });
  }
}
