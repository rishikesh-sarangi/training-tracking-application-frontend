import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchesProgramAddComponent } from './batches-program-add.component';

describe('BatchesProgramAddComponent', () => {
  let component: BatchesProgramAddComponent;
  let fixture: ComponentFixture<BatchesProgramAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BatchesProgramAddComponent]
    });
    fixture = TestBed.createComponent(BatchesProgramAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
