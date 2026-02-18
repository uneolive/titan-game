import { DivisionDocumentBO } from './DivisionDocumentBO.ts';

export interface DivisionBO {
  divisionNumber: string;
  divisionName: string;
  documents: DivisionDocumentBO[];
}
