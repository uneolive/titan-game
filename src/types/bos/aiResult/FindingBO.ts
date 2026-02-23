import { DocumentReferenceBO } from './DocumentReferenceBO.ts';

export interface FindingBO {
  specRequirement: string;
  referenceValue: string;
  submittalValue: string;
  status: string;
  confidenceScore: number;
  reviewNotes: string;
  specReference: DocumentReferenceBO;
  submittalReference: DocumentReferenceBO;
}
