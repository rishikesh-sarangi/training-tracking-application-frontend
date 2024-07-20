import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TableData } from '../../admin/shared/models/CourseTableData';

interface CourseWithTopics {
  courseId: number;
  courseName: string;
  code: string;
  description: string;
  theoryTime: number;
  practiceTime: number;
  topics: TopicDTO[];
}

interface TopicDTO {
  topicId: number;
  topicName: string;
  topicOrder: number;
  theoryTime: number;
  practiceTime: number;
}
@Injectable({
  providedIn: 'root',
})
export class CourseTableDataService {
  constructor(private _http: HttpClient) {}

  Index: string = 'http://localhost:5050/courses';

  addCourse(data: TableData): Observable<any> {
    return this._http.post(`${this.Index}`, data);
  }

  getCourses(): Observable<any> {
    return this._http.get(`${this.Index}`);
  }

  deleteCourses(id: number): Observable<any> {
    return this._http.delete(`${this.Index}/${id}`);
  }

  editCourses(id: number, data: TableData): Observable<any> {
    return this._http.put(`${this.Index}/${id}`, data);
  }

  getCoursesByBatchIdProgramIdTeacherId(data: any): Observable<any> {
    return this._http.post<any>(`${this.Index}/by-batch-program-teacher`, data);
  }
}
