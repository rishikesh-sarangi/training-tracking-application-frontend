import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAddedComponent } from './user-added.component';

describe('UserAddedComponent', () => {
  let component: UserAddedComponent;
  let fixture: ComponentFixture<UserAddedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UserAddedComponent]
    });
    fixture = TestBed.createComponent(UserAddedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
