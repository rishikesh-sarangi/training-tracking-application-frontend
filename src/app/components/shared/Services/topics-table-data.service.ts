import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, mergeMap } from 'rxjs';
import { Topic } from '../../admin/shared/models/Topic';
import { TopicDTO } from '../../admin/shared/models/TopicDTO';
@Injectable({
  providedIn: 'root',
})
export class TopicsTableDataService {
  constructor(private _http: HttpClient) {}

  Index: string = 'http://localhost:5050/topics';

  getTopicByCourseId(courseId: number): Observable<Topic[]> {
    return this._http.get<Topic[]>(this.Index + '/' + courseId);
  }

  addTopics(courseId: any, data: TopicDTO): Observable<Topic> {
    return this._http.post<Topic>(this.Index + `/${courseId}`, data);
  }

  editTopics(topicId: number, data: TopicDTO): Observable<Topic> {
    return this._http.put<Topic>(this.Index + `/${topicId}`, data);
  }

  deleteTopics(topicId: number): Observable<any> {
    return this._http.delete(`${this.Index}/${topicId}`);
  }
}
