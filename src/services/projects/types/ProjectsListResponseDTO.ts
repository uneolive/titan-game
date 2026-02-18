export interface ProjectsListResponseDTO {
  status: string;
  code: number;
  message: string;
  data: {
    projects: Array<{
      projectId: string;
      projectName: string;
      projectType: string;
      submittalsCount: number;
    }>;
  };
  requestId: string;
  timestamp: string;
}

// Inner data structure that adaptApiResponse extracts
export interface ProjectsListDataDTO {
  projects: Array<{
    projectId: string;
    projectName: string;
    projectType: string;
    submittalsCount: number;
  }>;
}

