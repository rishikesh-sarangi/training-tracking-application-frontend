import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpEventType } from '@angular/common/http';
import { EvaluationService } from '../Services/evaluation.service';

@Component({
  selector: 'app-single-file-upload',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './single-file-upload.component.html',
  styleUrls: ['./single-file-upload.component.scss'],
})
export class SingleFileUploadComponent {
  file: File | null = null;
  allowedFileTypes = ['.pdf', '.xls', '.xlsx', '.ppt', '.pptx', '.mp3', '.mp4'];
  uploadProgress = 0;
  maxFileSize = 2 * 1024 * 1024; // 2MB in bytes

  constructor(
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private dialogRef: MatDialogRef<SingleFileUploadComponent>,
    private evaluationService: EvaluationService
  ) {
    if (this.data.file) {
      this.file = this.data.file;
    }
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    this.handleFile(event.dataTransfer?.files || null);
  }

  fileBrowseHandler(event: Event) {
    const target = event.target as HTMLInputElement;
    this.handleFile(target.files);
  }

  handleFile(files: FileList | null) {
    if (files && files.length > 0) {
      const file = files[0];
      if (this.isValidFile(file)) {
        this.checkFileExistenceAndUpload(file);
      } else {
        this.showErrorMessage(
          'Invalid file. Please check the file type and size.'
        );
      }
    }
  }

  checkFileExistenceAndUpload(file: File) {
    const fileDTO: any = {
      batchId: this.data.parentPayload.batch.batchId,
      courseId: this.data.parentPayload.course.courseId,
      teacherId: this.data.parentPayload.teacher.teacherId,
      programId: this.data.parentPayload.program.programId,
      fileName: file.name,
    };

    this.evaluationService.doesFileExist(fileDTO).subscribe(
      (response: any) => {
        this.file = file;
        this.uploadFile();
      },
      (error) => {
        this.showErrorMessage(error.error.message);
      }
    );
  }

  isValidFile(file: File): boolean {
    const isValidType = this.allowedFileTypes.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );
    const isValidSize = file.size <= this.maxFileSize;
    return isValidType && isValidSize;
  }

  deleteFile() {
    this.file = null;
    this.uploadProgress = 0;
  }

  uploadFile() {
    if (!this.file) {
      this.showErrorMessage('No file selected for upload');
      return;
    }

    if (this.data.isTemporary) {
      this.dialogRef.close(this.file);
      return;
    }

    if (!this.data.evaluationId) {
      this.showErrorMessage('No evaluation ID provided');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.file, this.file.name);

    this.evaluationService
      .uploadFile(this.data.evaluationId, formData)
      .subscribe(
        (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.uploadProgress = Math.round(
              (100 * event.loaded) / event.total
            );
          } else if (event.type === HttpEventType.Response) {
            this.showSuccessMessage('File uploaded successfully');
            this.dialogRef.close(event.body);
          }
        },
        (err) => {
          if (err.error && typeof err.error === 'string') {
            this.showErrorMessage(err.error);
          } else {
            this.showErrorMessage('Error uploading file. Please try again.');
          }
          this.uploadProgress = 0;
        }
      );
  }

  showErrorMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top',
    });
  }

  showSuccessMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top',
    });
  }
}
