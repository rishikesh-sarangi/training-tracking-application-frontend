import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicsComponent } from './topics.component';

fdescribe('TopicsComponent', () => {
  let component: TopicsComponent;
  let fixture: ComponentFixture<TopicsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TopicsComponent],
    });
    fixture = TestBed.createComponent(TopicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
