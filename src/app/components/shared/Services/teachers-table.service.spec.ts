import { TestBed } from '@angular/core/testing';

import { TeachersTableService } from './teachers-table.service';

describe('TeachersTableService', () => {
  let service: TeachersTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeachersTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
