import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BatchProgramTeacherCoursesDelete } from 'src/app/components/admin/shared/models/BatchProgramTeacherCoursesDelete';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  Index: string = 'http://localhost:5050/attendance';
  constructor(private _http: HttpClient) {}

  addAttendance(data: any): Observable<any> {
    return this._http.post(this.Index, data);
  }

  getAttendanceByFilter(
    data: BatchProgramTeacherCoursesDelete
  ): Observable<any> {
    return this._http.post(this.Index + '/filter', data);
  }

  deleteAttendance(attendanceId: any): Observable<boolean> {
    return this._http.delete<boolean>(this.Index + `/${attendanceId}`);
  }
}
