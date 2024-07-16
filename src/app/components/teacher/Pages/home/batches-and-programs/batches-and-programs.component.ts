import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { BatchServiceService } from 'src/app/components/shared/Services/batch-service.service';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  NgForm,
} from '@angular/forms';
import { BatchProgramsService } from 'src/app/components/shared/Services/batch-programs.service';
@Component({
  selector: 'app-batches-and-programs',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './batches-and-programs.component.html',
  styleUrls: ['./batches-and-programs.component.scss'],
})
export class BatchesAndProgramsComponent implements OnInit {
  batches: any[] = [];
  programs: any[] = [];

  batchProgramReactiveForm!: FormGroup;

  constructor(
    private batchService: BatchServiceService,
    private batchProgramService: BatchProgramsService
  ) {}

  ngOnInit(): void {
    this.getBatches();
    this.batchProgramReactiveForm = new FormGroup({
      batch: new FormControl(null, Validators.required),
      batchStartDate: new FormControl(null, Validators.required),
      program: new FormControl(null, Validators.required),
    });
    // console.log(this.batches);
  }

  getBatches() {
    this.batchService.getBatches().subscribe({
      next: (data) => {
        for (const obj of data) {
          this.batches.push(obj);

          // console.log(obj);
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  getBatchProgram(batchCode: string) {
    // this.batchProgramService.getBatchProgramByBatchCode(batchCode).subscribe({
    //   next: (data) => {
    //     // this.programs = data;
    //     for (const obj of data) {
    //       // console.log(obj);
    //       this.programs.length = 0;
    //       for (const batchProgram of obj.batchPrograms) {
    //         this.programs.push(batchProgram);
    //         console.log(this.programs);
    //       }
    //     }
    //   },
    //   error: (error) => {
    //     console.log(error);
    //   },
    // });
  }

  onBatchChange(event: any) {
    for (const obj of this.batches) {
      if (obj.batchCode === event.value) {
        const batchStartDate = obj.batchStartDate;
        this.getBatchProgram(obj.batchCode);
        this.batchProgramReactiveForm
          .get('batchStartDate')
          ?.setValue(batchStartDate);
        return;
      }
    }
  }
}
