import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent {
  files: File[] = [];
  allowedFileTypes = ['.pdf', '.xls', '.ppt', '.mp3', 'mp4'];

  constructor(
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient
  ) {}

  topicId: string = this.data.topicId;
  onFileDropped(event: DragEvent) {
    event.preventDefault();
    this.handleFiles(event.dataTransfer?.files);
  }

  fileBrowseHandler(event: any) {
    this.handleFiles(event.target.files);
  }

  handleFiles(files: FileList | null | undefined) {
    if (files) {
      for (let i = 0; i < files.length; i++) {
        if (this.isValidFileType(files[i])) {
          this.files.push(files[i]);
        } else {
          this.snackBar.open(
            'Invalid file type. Only .pdf, .xls, .ppt, .mp3, .mp4 formats are allowed.',
            'Close',
            {
              duration: 3000,
            }
          );
        }
      }
    }
  }

  getFileNames(): string {
    return this.files.map((file) => file.name).join('\n');
  }

  isValidFileType(file: File): boolean {
    return this.allowedFileTypes.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );
  }

  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

  uploadFiles() {
    console.log(this.topicId);
    if (this.files.length === 0) {
      this.snackBar.open('No files to upload', 'Close', { duration: 3000 });
      return;
    }

    const formData = new FormData();
    this.files.forEach((file) => {
      formData.append('files', file, file.name);
    });

    this.http
      .post(`http://localhost:5050/topics/upload/${this.topicId}`, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .subscribe(
        (response: any) => {
          this.snackBar.open('Files uploaded successfully', 'Close', {
            duration: 3000,
          });
          this.files = []; // clear array
        },
        (error) => {
          this.snackBar.open(
            'Error uploading files: ' + error.message,
            'Close',
            { duration: 3000 }
          );
        }
      );
  }
}
