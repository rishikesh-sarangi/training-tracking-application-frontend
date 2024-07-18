import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Evaluation } from '../models/EvaluationModel';

@Injectable({
  providedIn: 'root',
})
export class EvaluationService {
  private endPoint: string = 'http://localhost:5050/evaluations';

  constructor(private _http: HttpClient) {}

  addEvaluation(data: any): Observable<Evaluation> {
    return this._http.post<any>(this.endPoint, data);
  }

  getEvaluation(): Observable<Evaluation[]> {
    return this._http.get<any>(this.endPoint);
  }

  getEvaluationsByFilters(filters: any): Observable<any> {
    return this._http.post<any>(this.endPoint + '/filter', filters);
  }

  deleteEvaluation(id: number): Observable<boolean> {
    return this._http.delete<boolean>(`${this.endPoint}/${id}`);
  }
}
