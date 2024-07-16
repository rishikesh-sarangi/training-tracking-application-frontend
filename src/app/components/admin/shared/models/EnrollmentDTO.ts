import { StudentTableData } from './StudentTableData';

export interface Enrollment {
  batchId: number;
  programId: string;
  students: StudentTableData[];
}
