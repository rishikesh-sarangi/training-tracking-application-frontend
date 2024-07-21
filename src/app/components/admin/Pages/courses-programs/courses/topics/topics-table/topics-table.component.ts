import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { TopicsTableDataService } from 'src/app/components/shared/Services/topics-table-data.service';
import { DeleteDialogueComponent } from '../../../../../../shared/delete-dialogue/delete-dialogue.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Topic } from 'src/app/components/admin/shared/models/Topic';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { MaterialModule } from 'src/app/material.module';
import { noWhitespaceValidator } from 'src/app/components/shared/Validators/NoWhiteSpaceValidator';
@Component({
  selector: 'app-topics-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDialogModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MaterialModule,
  ],
  templateUrl: './topics-table.component.html',
  styleUrls: ['./topics-table.component.scss'],
})
export class TopicsTableComponent implements OnInit {
  constructor(
    private topicService: TopicsTableDataService,
    private _deleteDialog: MatDialog,
    private dialog: MatDialog
  ) {}

  selectedCourse!: any;

  displayedColumns: string[] = [
    'actions',
    'order',
    'topicName',
    'theoryTime',
    'practiceTime',
    'summary',
    'content',
    'files',
  ];

  protected dataSource!: MatTableDataSource<Topic>;
  protected editTopicsReactiveForm!: FormGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.selectedCourse = history.state;
    // console.log(this.selectedCourse);
    this.getTopicsList(this.selectedCourse.courseId);

    this.editTopicsReactiveForm = new FormGroup({
      order: new FormControl(null, [
        Validators.required,
        Validators.pattern('[0-9]*'),
      ]),
      topicName: new FormControl(null, Validators.required),
      theoryTime: new FormControl(null, [
        Validators.required,
        Validators.pattern('[0-9]*'),
      ]),
      practiceTime: new FormControl(null, [
        Validators.required,
        Validators.pattern('[0-9]*'),
      ]),
      summary: new FormControl(null, [
        Validators.required,
        noWhitespaceValidator(),
        Validators.maxLength(40),
      ]),
      content: new FormControl(null, [
        Validators.required,
        noWhitespaceValidator(),
        Validators.maxLength(40),
      ]),
    });
  }
  // READ DATA
  protected getTopicsList(courseId: number) {
    this.topicService.getTopicByCourseId(courseId).subscribe((data) => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  // DELETE DATA
  deleteTopics(row: Topic) {
    // console.log(row.topicId);
    const dialogRef = this._deleteDialog.open(DeleteDialogueComponent, {
      data: {
        targetTopicName: row.topicName,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.topicService.deleteTopics(row.topicId).subscribe((data) => {
          this.getTopicsList(this.selectedCourse.courseId);
        });
      }
    });
  }

  // EDIT DATA
  editingRowID: number | null = null;
  protected editTopics(i: number, row: any) {
    // console.log(row);
    this.editingRowID = i;
    this.editTopicsReactiveForm.patchValue(row);
  }

  protected cancelEditing() {
    this.editingRowID = null;
    this.editTopicsReactiveForm.reset();
  }

  protected saveTopics(row: any) {
    if (
      this.editTopicsReactiveForm.value.order == row.order &&
      this.editTopicsReactiveForm.value.topicName == row.topicName &&
      this.editTopicsReactiveForm.value.theoryTime == row.theoryTime &&
      this.editTopicsReactiveForm.value.practiceTime == row.practiceTime &&
      this.editTopicsReactiveForm.value.summary == row.summary &&
      this.editTopicsReactiveForm.value.content == row.content
    ) {
      this.cancelEditing();
      return;
    }

    if (this.editTopicsReactiveForm.valid) {
      this.topicService
        .editTopics(row.topicId, this.editTopicsReactiveForm.value)
        .subscribe((data) => {
          this.editingRowID = null;
          this.getTopicsList(this.selectedCourse.courseId);
        });
    }
  }

  protected onFilesUploadClick(topicId: number) {
    const dialogRef = this.dialog.open(FileUploadComponent, {
      data: {
        topicId: topicId,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // console.log(result);
        this.getTopicsList(this.selectedCourse.courseId);
      }
    });
  }
  protected getFileNames(files: any): string {
    // console.log(remainingCourses);
    return files
      .map((file: any, index: any) => `${index + 1}. ${file.fileName}`)
      .join('\n');
  }

  // Search Filter
  @Input() filterValue!: string;

  // Refresh
  @Input() $clickEvent!: any;
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filterValue']) {
      this.applyFilter(this.filterValue);
    }

    if (changes['$clickEvent']) {
      // console.log('REFRESHINGGGGGG');
      this.getTopicsList(this.selectedCourse.courseId);
    }
  }

  applyFilter(filterValue: string) {
    // console.log(this.dataSource);
    if (this.dataSource) {
      this.dataSource.filter = this.filterValue.trim().toLowerCase();
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
  }
}
