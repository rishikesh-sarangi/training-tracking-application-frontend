import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {
  endpoint = 'http://localhost:3000/assignments';

  constructor(private _http: HttpClient) {}

  addAssignments(data: any): Observable<any> {
    return this._http.post(this.endpoint, data);
  }

  getAssignments(): Observable<any> {
    return this._http.get(this.endpoint);
  }

  deleteAssignments(id: number): Observable<any> {
    return this._http.delete(`${this.endpoint}/${id}`);
  }

  editAssignments(id: number, data: any): Observable<any> {
    return this._http.patch(`${this.endpoint}/${id}`, data);
  }
}
