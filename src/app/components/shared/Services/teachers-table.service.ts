import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TeachersTableData } from '../../admin/shared/models/TeachersTableData';

@Injectable({
  providedIn: 'root',
})
export class TeachersTableService {
  Index: string = 'http://localhost:5050/teachers';
  constructor(private _http: HttpClient) {}

  getTeachers(): Observable<TeachersTableData[]> {
    return this._http.get<TeachersTableData[]>(this.Index);
  }

  addTeachers(data: TeachersTableData): Observable<TeachersTableData> {
    return this._http.post<TeachersTableData>(this.Index, data);
  }

  editTeachers(teacherId: number, data: any): Observable<TeachersTableData> {
    return this._http.put<TeachersTableData>(
      `${this.Index}/${teacherId}`,
      data
    );
  }

  deleteTeachers(teacherId: number): Observable<Boolean> {
    return this._http.delete<Boolean>(`${this.Index}/${teacherId}`);
  }
  getTeacherByEmail(email: string): Observable<any> {
    return this._http.get<any>(`${this.Index}/${email}`);
  }

  getBatchDetailsByTeacherId(teacherId: number): Observable<any> {
    return this._http.get(
      this.Index + `/${teacherId}/batch-program-course-info`
    );
  }
}
