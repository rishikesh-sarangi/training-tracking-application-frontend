import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { BatchesProgramAddComponent } from './batches-program/batches-program-add/batches-program-add.component';
import { BatchesProgramTableComponent } from './batches-program/batches-program-table/batches-program-table.component';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  NgForm,
} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { BatchServiceService } from '../../../../shared/Services/batch-service.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogueComponent } from '../../../../shared/delete-dialogue/delete-dialogue.component';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { BatchProgramCoursesService } from 'src/app/components/shared/Services/batch-program-courses.service';
import { BatchLayer1Data } from '../../../shared/models/BatchLayer1Data';
import { noWhitespaceValidator } from 'src/app/components/shared/Validators/NoWhiteSpaceValidator';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-batches-table',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    BatchesProgramAddComponent,
    BatchesProgramTableComponent,
  ],
  templateUrl: './batches-table.component.html',
  styleUrls: ['./batches-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0px' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class BatchesTableComponent implements OnInit {
  constructor(
    private batchService: BatchServiceService,
    private _dialog: MatDialog,
    private batchProgramCoursesService: BatchProgramCoursesService,
    private snackBar: MatSnackBar
  ) {}
  editBatchReactiveForm!: FormGroup;
  dataSource!: MatTableDataSource<BatchLayer1Data>;
  editingRowID: number = -1;
  expandedRowAdd!: any;
  expandedRowTable!: any;
  displayedColumns: string[] = [
    'actions',
    'batchCode',
    'batchName',
    'batchStartDate',
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  ngOnInit(): void {
    // console.log(this.editingRowID);
    this.getBatches();
    this.editBatchReactiveForm = new FormGroup({
      batchCode: new FormControl(null, [
        Validators.required,
        noWhitespaceValidator(),
      ]),
      batchName: new FormControl(null, [
        Validators.required,
        noWhitespaceValidator(),
      ]),
      batchStartDate: new FormControl(null, [
        Validators.required,
        noWhitespaceValidator(),
      ]),
    });
  }
  getBatches() {
    this.batchService.getBatches().subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource<BatchLayer1Data>(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
  editBatch(id: number, row: BatchLayer1Data) {
    this.editingRowID = id;
    this.editBatchReactiveForm.patchValue(row);
  }

  cancelEditing() {
    this.editingRowID = -1;
    this.editBatchReactiveForm.reset();
  }
  saveBatch(row: BatchLayer1Data) {
    if (this.editBatchReactiveForm.valid) {
      this.batchService
        .editBatch(row.batchId, this.editBatchReactiveForm.value)
        .subscribe({
          next: (data) => {
            this.cancelEditing();
            this.getBatches();
          },
          error: (err) => {
            this.snackBar.open(err.error, 'Close', {
              duration: 2000,
            });
          },
        });
    }
  }

  deleteBatch(row: BatchLayer1Data) {
    const dialogRef = this._dialog.open(DeleteDialogueComponent, {
      data: {
        targetBatchCode: row.batchCode,
        targetBatchName: row.batchName,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.batchService.deleteBatch(row.batchId).subscribe({
          next: (data) => {
            this.getBatches();
          },
          error: (error) => {
            console.log(error);
          },
        });
      }
    });
  }

  // toggleRow
  isAddClicked: boolean = false;
  batchIdForChild!: number;

  toggleAdd(row: any) {
    this.expandedRowAdd = this.expandedRowAdd == row ? null : row;
    this.isAddClicked = !this.isAddClicked;
    this.batchIdForChild = row.batchId;
  }

  isTableClicked: boolean = false;
  toggleTable(row: any) {
    this.expandedRowTable = this.expandedRowTable == row ? null : row;
    this.isTableClicked = !this.isTableClicked;
    this.batchIdForChild = row.batchId;
    this.batchProgramCoursesService.setBatchId(row.batchId);
  }

  recieveIsAddClicked(value: boolean) {
    this.expandedRowTable = null;
    this.expandedRowAdd = null;

    this.isAddClicked = value;
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
      this.getBatches();
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
