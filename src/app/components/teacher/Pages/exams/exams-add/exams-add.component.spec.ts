import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamsAddComponent } from './exams-add.component';

describe('ExamsAddComponent', () => {
  let component: ExamsAddComponent;
  let fixture: ComponentFixture<ExamsAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ExamsAddComponent]
    });
    fixture = TestBed.createComponent(ExamsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
