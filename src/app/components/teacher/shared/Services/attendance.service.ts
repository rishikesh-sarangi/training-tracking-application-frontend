import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  Index: string = 'http://localhost:3000/attendance';
  constructor(private _http: HttpClient) {}

  addAttendance(data: any) {
    return this._http.post(this.Index, data);
  }

  getAttendances() {
    return this._http.get(this.Index);
  }
}
