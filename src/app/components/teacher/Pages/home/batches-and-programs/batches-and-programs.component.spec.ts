import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchesAndProgramsComponent } from './batches-and-programs.component';

describe('BatchesAndProgramsComponent', () => {
  let component: BatchesAndProgramsComponent;
  let fixture: ComponentFixture<BatchesAndProgramsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BatchesAndProgramsComponent]
    });
    fixture = TestBed.createComponent(BatchesAndProgramsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
