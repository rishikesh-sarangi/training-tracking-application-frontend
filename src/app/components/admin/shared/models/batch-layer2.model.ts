export interface BatchPrograms {
  programCode: string;
  programName: string;
  students: string[];
}

export interface BatchLayer2Data {
  batchCode: string;
  batchPrograms: BatchPrograms[];
}
