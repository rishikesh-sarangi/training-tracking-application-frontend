import { TableData } from './CourseTableData';

export interface ProgramsTable {
  programId: number;
  programCode: string;
  programName: string;
  theoryTime: string;
  practiceTime: string;
  description: string;
  courses: TableData[];
}
