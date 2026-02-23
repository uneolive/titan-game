import { FindingBO } from './FindingBO.ts';

export interface SubmittalResultBO {
  submittalTitle: string;
  specSection: string;
  overallStatus: string;
  complianceSummary: string;
  compliantCount: number;
  noncompliantCount: number;
  recommendation: string;
  findings: FindingBO[];
}
