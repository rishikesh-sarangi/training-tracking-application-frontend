import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BatchLayer2Data } from '../../admin/shared/models/batch-layer2.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BatchProgramsService {
  Index: string = 'http://localhost:3000/batchPrograms';

  constructor(private _http: HttpClient) {}

  addBatchPrograms(data: BatchLayer2Data): Observable<any> {
    return this._http.post(this.Index, data);
  }

  getBatchProgram(): Observable<any> {
    return this._http.get(`${this.Index}`);
  }

  getBatchProgramByBatchCode(batchCode: string): Observable<any> {
    return this._http.get(`${this.Index}?batchCode=${batchCode}`);
  }

  updateBatchProgram(id: string, data: any): Observable<any> {
    return this._http.patch(`${this.Index}/${id}`, data);
  }

  deleteBatchProgram(batchCode: string, programCode: string): Observable<any> {
    return this._http.delete(
      `${this.Index}?batchCode=${batchCode}&programCode=${programCode}`
    );
  }
}
