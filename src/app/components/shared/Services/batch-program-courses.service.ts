import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BatchProgramCoursesService {
  Index: string = 'http://localhost:3000/batchProgramsCourses';
  batchId!: number;
  constructor(private _http: HttpClient) {}

  setBatchId(batchId: number) {
    this.batchId = batchId;
  }

  getBatchId() {
    return this.batchId;
  }

  addBatchProgramCourses(data: any) {
    return this._http.post(this.Index, data);
  }

  getBatchProgramCourses(): Observable<any> {
    return this._http.get(this.Index);
  }

  getBatchProgramCoursesByID(batchProgramID: string): Observable<any> {
    return this._http.get(`${this.Index}?batchProgramID=${batchProgramID}`);
  }
}
