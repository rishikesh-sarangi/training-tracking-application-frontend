import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StudentTableData } from '../../admin/shared/models/StudentTableData';

@Injectable({
  providedIn: 'root',
})
export class StudentTableService {
  Index: string = 'http://localhost:5050/students';

  constructor(private _http: HttpClient) {}

  addStudent(data: StudentTableData): Observable<StudentTableData> {
    return this._http.post<StudentTableData>(`${this.Index}`, data);
  }

  getStudents(): Observable<StudentTableData[]> {
    return this._http.get<StudentTableData[]>(`${this.Index}`);
  }

  getStudentsByBatchAndProgram(
    batchId: number,
    programId: number
  ): Observable<StudentTableData[]> {
    return this._http.get<StudentTableData[]>(
      `${this.Index}/${batchId}/${programId}`
    );
  }

  editStudent(studentId: number, data: any): Observable<StudentTableData> {
    return this._http.put<StudentTableData>(`${this.Index}/${studentId}`, data);
  }

  deleteStudents(id: number): Observable<Boolean> {
    return this._http.delete<Boolean>(`${this.Index}/${id}`);
  }
}
