import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchesProgramTableComponent } from './batches-program-table.component';

describe('BatchesProgramTableComponent', () => {
  let component: BatchesProgramTableComponent;
  let fixture: ComponentFixture<BatchesProgramTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BatchesProgramTableComponent]
    });
    fixture = TestBed.createComponent(BatchesProgramTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
