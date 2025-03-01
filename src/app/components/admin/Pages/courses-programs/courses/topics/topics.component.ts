import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { TableData } from 'src/app/components/admin/shared/models/CourseTableData';
import { TopicsTableComponent } from './topics-table/topics-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OverlayModule } from '@angular/cdk/overlay';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  NgForm,
} from '@angular/forms';
import { TopicsTableDataService } from 'src/app/components/shared/Services/topics-table-data.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CoursesTableComponent } from '../courses-table/courses-table.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { noWhitespaceValidator } from 'src/app/components/shared/Validators/NoWhiteSpaceValidator';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-topics',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatInputModule,
    MatTableModule,
    ReactiveFormsModule,
    MatMenuModule,
    OverlayModule,
    TopicsTableComponent,
    MatTooltipModule,
  ],
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss'],
})
export class TopicsComponent implements OnInit {
  constructor(
    private addTopicsData: TopicsTableDataService,
    private snackBar: MatSnackBar
  ) {}

  displayedColumns: string[] = [
    'actions',
    'topicName',
    'theoryTime',
    'practiceTime',
    'summary',
    'content',
  ];

  selectedCourse!: TableData;

  courseId!: number;

  selectedCourseId!: number;

  isAddTopicsClicked: boolean = false;

  addTopicsReactiveForm!: FormGroup;

  ngOnInit(): void {
    this.selectedCourse = history.state;
    this.courseId = this.selectedCourse.courseId;
    // console.log(
    //   typeof this.selectedCourse.courseId + ' ' + this.selectedCourse.courseId
    // );

    // console.log(this.selectedCourse);

    this.addTopicsReactiveForm = new FormGroup({
      topicName: new FormControl(null, [
        Validators.required,
        noWhitespaceValidator(),
        Validators.maxLength(10),
      ]),
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

  onSubmit() {
    if (this.addTopicsReactiveForm.valid) {
      // console.log(this.addTopicsReactiveForm.value);

      this.addTopicsData
        .addTopics(this.courseId, this.addTopicsReactiveForm.value)
        .subscribe(
          (data) => {
            this.addTopicsReactiveForm.reset();
            this.isAddTopicsClicked = !this.isAddTopicsClicked;
            this.refreshTopicsTable();
          },
          (error) => {
            this.snackBar.open(error.error, 'Close', {
              duration: 3000,
            });
          }
        );
    }
  }

  closeForm() {
    this.addTopicsReactiveForm.reset();
    this.isAddTopicsClicked = !this.isAddTopicsClicked;
    this.refreshTopicsTable();
  }
  refreshTopicsTable() {
    // Trigger a refresh of the topics table
    this.$clickEvent = new Date().getTime(); // Use a timestamp to force change detection
  }

  addTopics() {
    this.isAddTopicsClicked = !this.isAddTopicsClicked;
  }

  // 0/40 logic
  // For Content
  protected isContentOpen = false;
  protected lettersTypedContent: number = 0;

  protected onContentInputChange(event: any) {
    this.lettersTypedContent = event.target.value.length;
    return;
  }

  // For Summary
  protected isSummaryOpen = false;
  protected lettersTypedSummary: number = 0;

  protected onSummaryInputChange(event: any) {
    this.lettersTypedSummary = event.target.value.length;
    return;
  }

  // Search Filter
  SearchValue: string = '';
  onSearchChange(event: any) {
    this.SearchValue = (event.target as HTMLInputElement).value;
  }

  $clickEvent!: any;
  refresh($event: any) {
    window.location.reload();
    // console.log('parent clicked');
  }
}
