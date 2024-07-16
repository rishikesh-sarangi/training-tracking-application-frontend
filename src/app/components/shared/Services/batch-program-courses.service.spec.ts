import { TestBed } from '@angular/core/testing';

import { BatchProgramCoursesService } from './batch-program-courses.service';

describe('BatchProgramCoursesService', () => {
  let service: BatchProgramCoursesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BatchProgramCoursesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
