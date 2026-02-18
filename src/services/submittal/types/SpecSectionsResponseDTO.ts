export interface SpecSectionsResponseDTO {
  status: string;
  code: number;
  message: string;
  data: {
    divisions: {
      mechanical: {
        divisionNumber: number;
        divisionName: string;
        sections: Array<{
          number: string;
          title: string;
        }>;
      } | null;
      electrical: {
        divisionNumber: number;
        divisionName: string;
        sections: Array<{
          number: string;
          title: string;
        }>;
      } | null;
    };
  };
  requestId: string;
  timestamp: string;
}

// Inner data structure that adaptApiResponse extracts
export interface SpecSectionsDataDTO {
  divisions: {
    mechanical: {
      divisionNumber: number;
      divisionName: string;
      sections: Array<{
        number: string;
        title: string;
      }>;
    } | null;
    electrical: {
      divisionNumber: number;
      divisionName: string;
      sections: Array<{
        number: string;
        title: string;
      }>;
    } | null;
  };
}

