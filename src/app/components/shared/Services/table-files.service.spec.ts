import { TestBed } from '@angular/core/testing';

import { TableFilesService } from './table-files.service';

describe('TableFilesService', () => {
  let service: TableFilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableFilesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
