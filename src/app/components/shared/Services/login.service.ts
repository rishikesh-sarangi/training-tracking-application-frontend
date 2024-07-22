import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginCredentials } from '../models/LoginCredentials';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  endpoint: string = 'http://localhost:5050/users';

  constructor(
    private _http: HttpClient,
    private router: Router,
    private dialog: MatDialog
  ) {}

  login(loginCredentials: LoginCredentials): Observable<any> {
    return this._http
      .post<any>(this.endpoint + '/login', loginCredentials)
      .pipe(
        tap((response) => {
          if (response.token) {
            localStorage.setItem('token', response.token);
          }
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // getToken(): string | null {
  //   return localStorage.getItem('jwt_token');
  // }

  logout(): void {
    // localStorage.removeItem('token');
    // localStorage.removeItem('loggedInSaveAdmin');
    // localStorage.removeItem('loggedInSaveTeacher');
    // localStorage.removeItem('username');
    // localStorage.removeItem('teacherDetails');
    localStorage.clear();
    this.router.navigate(['']);
    this.dialog.closeAll();
  }

  checkEmailValidity(email: string): Observable<any> {
    return this._http.post<any>(this.endpoint + '/email', email);
  }
}
