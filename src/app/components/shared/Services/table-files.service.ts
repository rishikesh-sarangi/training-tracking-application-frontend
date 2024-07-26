import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TableFilesService {
  private endpoint: string = 'http://localhost:5050/tableFiles';
  constructor(private _http: HttpClient) {}

  deleteFilesByFileNamesAndCourseId(
    filesNames: string[],
    courseId: any
  ): Observable<any> {
    return this._http.post<any>(
      `${this.endpoint}/deleteTopicFilesByFileNamesAndCourseId/${courseId}`,
      filesNames
    );
  }

  deleteByEvaluationId(evaluationId: any): Observable<any> {
    return this._http.delete<any>(`${this.endpoint}/${evaluationId}`);
  }
}
