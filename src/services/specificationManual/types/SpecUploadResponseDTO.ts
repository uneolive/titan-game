export interface SpecUploadResponseDTO {
  status: string;
  code: number;
  message: string;
  data: SpecUploadDataDTO;
  requestId: string;
  timestamp: string;
}

export interface SpecUploadDataDTO {
  projectId: string;
}

