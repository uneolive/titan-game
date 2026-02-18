import { ProgressStepBO } from './ProgressStepBO.ts';

export interface SubmittalCompleteBO {
  submittalId: string;
  status: string;
  overallStatus: string;
  progressPct: number;
  message: string;
  steps: ProgressStepBO[];
}
