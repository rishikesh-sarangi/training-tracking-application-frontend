import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProgramsTable } from '../../admin/shared/models/ProgramsTable';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProgramsTableService {
  constructor(private _http: HttpClient) {}

  Index: string = 'http://localhost:5050/programs';

  getPrograms(): Observable<ProgramsTable> {
    return this._http.get<ProgramsTable>(this.Index);
  }

  addPrograms(data: ProgramsTable): Observable<ProgramsTable> {
    return this._http.post<ProgramsTable>(this.Index, data);
  }

  editPrograms(
    programId: number,
    data: ProgramsTable
  ): Observable<ProgramsTable> {
    return this._http.put<ProgramsTable>(`${this.Index}/${programId}`, data);
  }

  deleteProgram(programId: number): Observable<Boolean> {
    return this._http.delete<Boolean>(`${this.Index}/${programId}`);
  }
}
