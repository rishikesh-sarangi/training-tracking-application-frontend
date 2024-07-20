import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginCredentials } from '../models/LoginCredentials';
import { Credentials } from '../models/Credentials';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  endpoint: string = 'http://localhost:5050/users';

  constructor(private _http: HttpClient) {}

  login(loginCredentials: any): Observable<any> {
    return this._http.post<any>(this.endpoint + '/login', loginCredentials);
  }
}
