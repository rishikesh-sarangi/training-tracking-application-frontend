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
  constructor(private batchService: BatchServiceService) {}

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
      batchCode: new FormControl(null, Validators.required),
      batchName: new FormControl(null, Validators.required),
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
          console.log(err);
        },
      });
    }
  }
  closeForm() {
    this.addBatchReactiveForm.reset();
    this.isBatchClicked = !this.isBatchClicked;
  }
}
