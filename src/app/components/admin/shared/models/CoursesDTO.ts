export interface CoursesDTO {
  courseId: number;
  courseCode: string;
  courseName: string;
  teachers: TeacherDTO[];
}

export interface TeacherDTO {
  teacherId: number;
  teacherName: string;
  teacherEmail: string;
}
