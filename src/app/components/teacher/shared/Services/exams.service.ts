import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExamsService {
  endpoint = 'http://localhost:3000/exams';

  constructor(private _http: HttpClient) {}

  addExams(data: any): Observable<any> {
    return this._http.post(this.endpoint, data);
  }

  getExams(): Observable<any> {
    return this._http.get(this.endpoint);
  }

  deleteExams(id: number): Observable<any> {
    return this._http.delete(`${this.endpoint}/${id}`);
  }

  editExams(id: number, data: any): Observable<any> {
    return this._http.patch(`${this.endpoint}/${id}`, data);
  }
}
