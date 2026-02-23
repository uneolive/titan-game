export interface ProjectSetupResponseDTO {
  status: string;
  code: number;
  message: string;
  data: ProjectSetupDataDTO;
  requestId: string;
  timestamp: string;
}

export interface ProjectSetupDataDTO {
  projectName: string;
  projectType: string;
  isDivisionBased: boolean;
  divisions: DivisionDTO[];
}

export interface DivisionDTO {
  divisionNumber: string;
  divisionName: string;
  documents: DivisionDocumentDTO[];
}

export interface DivisionDocumentDTO {
  documentId: string;
  documentName: string;
  documentTag: string;
}

