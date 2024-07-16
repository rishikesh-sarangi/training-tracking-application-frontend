import { TestBed } from '@angular/core/testing';

import { StudentTableService } from './student-table.service';

describe('StudentTableService', () => {
  let service: StudentTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
