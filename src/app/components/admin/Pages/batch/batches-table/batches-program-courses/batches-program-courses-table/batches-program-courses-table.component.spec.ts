import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchesProgramCoursesTableComponent } from './batches-program-courses-table.component';

describe('BatchesProgramCoursesTableComponent', () => {
  let component: BatchesProgramCoursesTableComponent;
  let fixture: ComponentFixture<BatchesProgramCoursesTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BatchesProgramCoursesTableComponent]
    });
    fixture = TestBed.createComponent(BatchesProgramCoursesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
