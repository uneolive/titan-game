export interface SubmittalResultResponseDTO {
  status: string;
  code: number;
  message: string;
  data: {
    submittalTitle: string;
    specSection: string;
    overallStatus: string;
    complianceSummary: string;
    compliantCount: number;
    noncompliantCount: number;
    recommendation: string;
    findings: Array<{
      specRequirement: string;
      referenceValue: string;
      submittalValue: string;
      status: string;
      confidenceScore: number;
      reviewNotes: string;
      specReference: {
        s3Url: string;
      };
      submittalReference: {
        s3Url: string;
      };
    }>;
  };
  requestId: string;
  timestamp: string;
}

// Inner data structure that adaptApiResponse extracts
export interface SubmittalResultDataDTO {
  submittalTitle: string;
  specSection: string;
  overallStatus: string;
  complianceSummary: string;
  compliantCount: number;
  noncompliantCount: number;
  recommendation: string;
  findings: Array<{
    specRequirement: string;
    referenceValue: string;
    submittalValue: string;
    status: string;
    confidenceScore: number;
    reviewNotes: string;
    specReference: {
      s3Url: string;
    };
    submittalReference: {
      s3Url: string;
    };
  }>;
}

