import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Enrollment } from '../../admin/shared/models/EnrollmentDTO';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EnrollmentService {
  Index = 'http://localhost:5050/enrollments';

  constructor(private _http: HttpClient) {}

  enrollStudents(data: Enrollment): Observable<boolean> {
    return this._http.post<boolean>(this.Index, data);
  }

  updateEnrollment(data: any): Observable<boolean> {
    return this._http.put<boolean>(this.Index, data);
  }
}
