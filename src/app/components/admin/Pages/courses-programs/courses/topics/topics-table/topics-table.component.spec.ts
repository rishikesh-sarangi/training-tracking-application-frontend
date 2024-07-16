import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicsTableComponent } from './topics-table.component';

describe('TopicsTableComponent', () => {
  let component: TopicsTableComponent;
  let fixture: ComponentFixture<TopicsTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TopicsTableComponent],
    });
    fixture = TestBed.createComponent(TopicsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
