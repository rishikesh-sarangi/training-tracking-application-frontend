import { TableData } from './CourseTableData';

export interface TeachersTableData {
  teacherId: number;
  teacherName: string;
  courses: TableData[];
  teacherEmail: string;
}
