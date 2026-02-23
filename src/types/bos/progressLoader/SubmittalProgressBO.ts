import { ProgressStepBO } from './ProgressStepBO.ts';

export interface SubmittalProgressBO {
  submittalId: string;
  stepIndex: number;
  stepName: string;
  stepDescription: string;
  status: string;
  progressPct: number;
  steps: ProgressStepBO[];
}
