import { TestBed } from '@angular/core/testing';

import { BatchProgramsService } from './batch-programs.service';

describe('BatchProgramsService', () => {
  let service: BatchProgramsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BatchProgramsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
