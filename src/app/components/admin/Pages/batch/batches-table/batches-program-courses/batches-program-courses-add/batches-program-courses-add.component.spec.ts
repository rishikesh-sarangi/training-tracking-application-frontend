import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchesProgramCoursesAddComponent } from './batches-program-courses-add.component';

describe('BatchesProgramCoursesAddComponent', () => {
  let component: BatchesProgramCoursesAddComponent;
  let fixture: ComponentFixture<BatchesProgramCoursesAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BatchesProgramCoursesAddComponent]
    });
    fixture = TestBed.createComponent(BatchesProgramCoursesAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
