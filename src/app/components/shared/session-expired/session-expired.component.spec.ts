import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionExpiredComponent } from './session-expired.component';

describe('SessionExpiredComponent', () => {
  let component: SessionExpiredComponent;
  let fixture: ComponentFixture<SessionExpiredComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SessionExpiredComponent]
    });
    fixture = TestBed.createComponent(SessionExpiredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
