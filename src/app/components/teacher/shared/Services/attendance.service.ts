import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  Index: string = 'http://localhost:5050/attendance';
  constructor(private _http: HttpClient) {}
}
