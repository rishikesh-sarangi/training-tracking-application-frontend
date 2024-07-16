import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramsTableComponent } from './programs-table.component';

describe('ProgramsTableComponent', () => {
  let component: ProgramsTableComponent;
  let fixture: ComponentFixture<ProgramsTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProgramsTableComponent]
    });
    fixture = TestBed.createComponent(ProgramsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
