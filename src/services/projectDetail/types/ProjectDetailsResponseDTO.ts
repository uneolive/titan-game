export interface ProjectDetailsResponseDTO {
  project: {
    projectId: string;
    projectName: string;
    projectType: string;
  };
  specificationDocumentsCount: number;
  submittalsCount: number;
  specificationDocuments: Array<{
    documentId: string;
    documentName: string;
    documentTag: string;
    s3Url: string;
    date: string;
  }>;
  submittals: Array<{
    submittalId: string;
    submittalTitle: string;
    specSection: string;
    overallStatus: string;
    progressPct: number;
    date: string;
  }>;
}

