import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { BatchesTableComponent } from './batches-table/batches-table.component';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  NgForm,
  FormsModule,
} from '@angular/forms';
import { BatchServiceService } from '../../../shared/Services/batch-service.service';
import { noWhitespaceValidator } from 'src/app/components/shared/Validators/NoWhiteSpaceValidator';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-batch',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    BatchesTableComponent,
  ],
  templateUrl: './batch.component.html',
  styleUrls: ['./batch.component.scss'],
})
export class BatchComponent implements OnInit {
  constructor(
    private batchService: BatchServiceService,
    private snackBar: MatSnackBar
  ) {}

  isBatchClicked: boolean = false;
  protected addBatchReactiveForm!: FormGroup;
  displayedColumns: string[] = [
    'actions',
    'batchCode',
    'batchName',
    'batchStartDate',
  ];

  ngOnInit(): void {
    this.addBatchReactiveForm = new FormGroup({
      batchCode: new FormControl(null, [
        Validators.required,
        noWhitespaceValidator(),
      ]),
      batchName: new FormControl(null, [
        Validators.required,
        noWhitespaceValidator(),
      ]),
      batchStartDate: new FormControl(null, Validators.required),
    });
  }
  onSubmit() {
    if (this.addBatchReactiveForm.valid) {
      this.batchService.addBatch(this.addBatchReactiveForm.value).subscribe({
        next: () => {
          this.isBatchClicked = !this.isBatchClicked;
          this.addBatchReactiveForm.reset();
        },
        error: (err) => {
          this.snackBar.open(err.error, 'Close', {
            duration: 2000,
          });
        },
      });
    }
  }
  closeForm() {
    this.addBatchReactiveForm.reset();
    this.isBatchClicked = !this.isBatchClicked;
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
