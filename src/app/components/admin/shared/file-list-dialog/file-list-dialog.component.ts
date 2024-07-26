import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { TableFilesService } from 'src/app/components/shared/Services/table-files.service';

@Component({
  selector: 'app-file-list-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './file-list-dialog.component.html',
  styleUrls: ['./file-list-dialog.component.scss'],
})
export class FileListDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<FileListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private tableFileService: TableFilesService
  ) {}

  ngOnInit(): void {
    console.log(this.data);
  }

  deletionPayload: Set<string> = new Set();

  toggleFileDeletion(file: any) {
    if (this.deletionPayload.has(file.fileName)) {
      this.deletionPayload.delete(file.fileName);
    } else {
      this.deletionPayload.add(file.fileName);
    }
    console.log(this.deletionPayload);
  }

  isFileMarkedForDeletion(file: any): boolean {
    return this.deletionPayload.has(file.fileName);
  }

  onSave() {
    const fileNames = Array.from(this.deletionPayload);
    if (this.data.targetCourseId) {
      this.tableFileService
        .deleteFilesByFileNamesAndCourseId(fileNames, this.data.targetCourseId)
        .subscribe();
    } else if (this.data.targetEvaluationId) {
      this.tableFileService
        .deleteByEvaluationId(this.data.targetEvaluationId)
        .subscribe();
    }
    this.dialogRef.close(this.deletionPayload);
  }
}
