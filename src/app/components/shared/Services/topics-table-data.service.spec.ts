import { TestBed } from '@angular/core/testing';

import { TopicsTableDataService } from './topics-table-data.service';

describe('TopicsTableDataService', () => {
  let service: TopicsTableDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TopicsTableDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
