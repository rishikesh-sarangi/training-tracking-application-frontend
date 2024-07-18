import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BatchLayer1Data } from '../../admin/shared/models/BatchLayer1Data';
import { CoursesDTO } from '../../admin/shared/models/CoursesDTO';
import { BatchProgramCourse } from '../../admin/shared/models/BatchProgramCourse';
import { BatchProgramTeacherCoursesDelete } from '../../admin/shared/models/BatchProgramTeacherCoursesDelete';

@Injectable({
  providedIn: 'root',
})
export class BatchServiceService {
  Index: string = 'http://localhost:5050/batches';
  constructor(private _http: HttpClient) {}

  addBatch(data: BatchLayer1Data): Observable<BatchLayer1Data> {
    return this._http.post<BatchLayer1Data>(this.Index, data);
  }

  getBatches(): Observable<any> {
    return this._http.get(this.Index);
  }

  deleteBatch(id: number): Observable<any> {
    return this._http.delete(this.Index + '/' + id);
  }

  deleteProgramBatch(programId: number, batchId: number): Observable<any> {
    return this._http.delete(this.Index + `/${batchId}/programs/${programId}`);
  }

  editBatch(id: number, data: BatchLayer1Data): Observable<BatchLayer1Data> {
    return this._http.put<BatchLayer1Data>(this.Index + '/' + id, data);
  }

  getBatchPrograms(batchId: number) {
    return this._http.get(this.Index + `/${batchId}/programs-and-students`);
  }

  // this function is used to get the courses associated with the program under a batch
  // since we are getting courses we get the corresponding teachers as well
  getBatchProgramCourses(
    batchId: number,
    programId: number
  ): Observable<CoursesDTO[]> {
    return this._http.get<CoursesDTO[]>(
      this.Index + `/${batchId}/program/${programId}/courses-teachers`
    );
  }

  // this function will set the relationship between batch, course and the teacher
  setBatchProgramCourses(batchProgramCourse: BatchProgramCourse) {
    return this._http.post(
      'http://localhost:5050/batch-course-teacher/update',
      batchProgramCourse
    );
  }

  deleteBatchProgramCourses(
    data: BatchProgramTeacherCoursesDelete
  ): Observable<boolean> {
    return this._http.post<boolean>(
      'http://localhost:5050/batch-course-teacher',
      data
    );
  }

  getCoursesAndTeacher(batchId: number, programId: number): Observable<any> {
    return this._http.get(
      'http://localhost:5050/batch-course-teacher' + `/${batchId}/${programId}`
    );
  }

  getBatchDetailsByTeacherId(teacherId: number): Observable<any> {
    return this._http.get(
      `http://localhost:5050/teachers/${teacherId}/batch-program-course-info`
    );
  }
}
