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
  teacherId!: number;

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl(null, Validators.required),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
      ]),
      keepSignedIn: new FormControl(false),
    });
  }

  protected onSubmit() {
    // const loginData = {
    //   ...this.loginForm.value,
    //   keepSignedIn: this.loginForm.get('keepSignedIn')?.value,
    // };

    this.loginService.login(this.loginForm.value).subscribe({
      next: (response: any) => {
        const storage = this.loginForm.value.keepSignedIn
          ? localStorage
          : sessionStorage;

        storage.setItem('token', response.token);
        storage.setItem('userRole', response.userRole);
        storage.setItem('username', response.username);
        // console.log(response);
        if (response.userRole === 'ROLE_ADMIN') {
          localStorage.setItem('loggedInSaveAdmin', 'true');
          // localStorage.setItem('username', response.username);
          localStorage.setItem('username', 'admin');
          this.router.navigate(['admin/home/', 'courses']);
        } else if (response.userRole === 'ROLE_TEACHER') {
          console.log('inside teacher');
          this.teacherService
            .getTeacherByEmail(this.loginForm.value.email)
            .subscribe({
              next: (data) => {
                console.log(data);
                const teacherDetails = {
                  username: data.teacherName,
                  teacherId: data.teacherId,
                };

                localStorage.setItem(
                  'teacherDetails',
                  JSON.stringify(teacherDetails)
                );

                localStorage.setItem('loggedInSaveTeacher', 'true');
                this.router.navigate(['teacher', 'home']);
              },
              error: (err) => {
                this.snackBar.open('Error fetching data!', 'Close', {
                  horizontalPosition: 'end',
                  verticalPosition: 'top',
                  duration: 2000,
                });
              },
            });
        }
      },
      error: (err) => {
        console.log(err);
        this.snackBar.open(err.error.error, 'Close', {
          horizontalPosition: 'end',
          verticalPosition: 'top',
          duration: 2000,
        });
      },
    });
  }
}
