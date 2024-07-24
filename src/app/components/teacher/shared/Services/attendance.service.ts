import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BatchProgramTeacherCoursesDelete } from 'src/app/components/admin/shared/models/BatchProgramTeacherCoursesDelete';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  Index: string = 'http://localhost:5050/attendance';

  private endPointforAttendanceStudent: string =
    'http://localhost:5050/attendanceStudent';

  constructor(private _http: HttpClient) {}

  addAttendance(data: any): Observable<any> {
    return this._http.post(this.Index, data);
  }

  getAttendanceByFilter(data: any): Observable<any> {
    return this._http.post(this.Index + '/filter', data);
  }

  deleteAttendance(attendanceId: any): Observable<boolean> {
    return this._http.delete<boolean>(this.Index + `/${attendanceId}`);
  }

  updateAttendance(attendanceId: number, data: any): Observable<any> {
    return this._http.patch<any>(this.Index + `/${attendanceId}`, data);
  }

  getByBatchProgramTeacher(data: any): Observable<any> {
    return this._http.post<any>(`${this.Index}/by-batch-program-teacher`, data);
  }

  saveAttendanceForStudents(data: any): Observable<any> {
    return this._http.post<any>(
      `${this.endPointforAttendanceStudent}/saveAll`,
      data
    );
  }

  getAttendanceForStudents(): Observable<any> {
    return this._http.get<any>(this.endPointforAttendanceStudent);
  }
}
