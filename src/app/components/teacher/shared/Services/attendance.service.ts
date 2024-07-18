import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  Index: string = 'http://localhost:5050/attendance';
  constructor(private _http: HttpClient) {}

  addAttendance(data: any): Observable<any> {
    return this._http.post(this.Index, data);
  }

  getAttendance(): Observable<any> {
    return this._http.get(this.Index);
  }
}
