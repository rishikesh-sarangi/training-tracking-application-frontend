import { TestBed } from '@angular/core/testing';

import { CourseTableDataService } from './course-table-data.service';

describe('CourseTableDataService', () => {
  let service: CourseTableDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourseTableDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
