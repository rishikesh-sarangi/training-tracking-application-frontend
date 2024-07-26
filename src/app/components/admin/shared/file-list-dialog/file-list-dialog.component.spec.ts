import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileListDialogComponent } from './file-list-dialog.component';

describe('FileListDialogComponent', () => {
  let component: FileListDialogComponent;
  let fixture: ComponentFixture<FileListDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FileListDialogComponent]
    });
    fixture = TestBed.createComponent(FileListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
