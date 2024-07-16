import { TestBed } from '@angular/core/testing';

import { ProgramsTableService } from './programs-table.service';

describe('ProgramsTableService', () => {
  let service: ProgramsTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgramsTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
