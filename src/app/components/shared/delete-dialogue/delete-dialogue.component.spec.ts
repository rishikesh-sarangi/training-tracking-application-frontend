import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteDialogueComponent } from './delete-dialogue.component';

describe('DeleteDialogueComponent', () => {
  let component: DeleteDialogueComponent;
  let fixture: ComponentFixture<DeleteDialogueComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DeleteDialogueComponent]
    });
    fixture = TestBed.createComponent(DeleteDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
