import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  NgForm,
} from '@angular/forms';
import { BatchProgramCoursesService } from 'src/app/components/shared/Services/batch-program-courses.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BatchServiceService } from 'src/app/components/shared/Services/batch-service.service';
@Component({
  selector: 'app-batches-program-courses-table',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './batches-program-courses-table.component.html',
  styleUrls: ['./batches-program-courses-table.component.scss'],
})
export class BatchesProgramCoursesTableComponent implements OnInit {
  editBatchProgramCourses!: FormGroup;

  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['actions', 'code', 'courseName', 'teacherName'];

  editingRowID: number | null = null;

  @Input() programId!: number;
  @Input() batchId!: number;

  constructor(private batchService: BatchServiceService) {}

  ngOnInit(): void {
    this.getBatchProgramCourses();
    this.editBatchProgramCourses = new FormGroup({
      code: new FormControl(null, Validators.required),
      courseName: new FormControl(null, Validators.required),
      teacherName: new FormControl(null, Validators.required),
    });
  }

  getBatchProgramCourses() {
    this.batchService
      .getCoursesAndTeacher(this.batchId, this.programId)
      .subscribe((data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
  }

  saveBatchProgramCourse(row: any) {}
  deleteBatchProgramCourse(row: any) {}
  editBatchProgramCourse(i: number, row: any) {}
  cancelEditing() {}
}
