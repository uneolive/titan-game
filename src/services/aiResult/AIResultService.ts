import {
  client,
  isMockApiEnabled,
  subscribeToMockSubmittalProgress,
} from '@/client/mockClient.ts';
import { convertKeysToCamelCase } from '@/helpers/utilities/caseConverter.ts';
import { ServiceResult } from '@/types/common/ServiceResult.ts';
import { ServiceResultStatusENUM } from '@/types/enums/ServiceResultStatusENUM.ts';
import {
  SubmittalResultDataDTO,
  SubmittalResultResponseDTO,
} from './types/SubmittalResultResponseDTO.ts';
import { SubmittalProgressBO } from '@/types/bos/progressLoader/SubmittalProgressBO.ts';
import { SubmittalCompleteBO } from '@/types/bos/progressLoader/SubmittalCompleteBO.ts';

function toServiceResult<T>(payload: {
  code?: number;
  data?: T | null;
  message?: string;
}): ServiceResult<T> {
  const code = payload.code ?? ServiceResultStatusENUM.ERROR;

  if (code === 200) {
    return {
      data: payload.data ?? null,
      message: payload.message ?? 'Success',
      statusCode: ServiceResultStatusENUM.SUCCESS,
    };
  }

  return {
    data: null,
    message: payload.message ?? 'Request failed',
    statusCode: ServiceResultStatusENUM.ERROR,
  };
}

export async function getSubmittalResult(
  submittalId: string
): Promise<ServiceResult<SubmittalResultDataDTO>> {
  try {
    const response = await client(`/api/submittals/${submittalId}/result`, null, 'GET');
    const camelCaseData = convertKeysToCamelCase<SubmittalResultResponseDTO>(response.data);

    return toServiceResult<SubmittalResultDataDTO>({
      code: camelCaseData.code,
      data: camelCaseData.data,
      message: camelCaseData.message,
    });
  } catch {
    return {
      data: null,
      message: 'Failed to load submittal result',
      statusCode: ServiceResultStatusENUM.ERROR,
    };
  }
}

export function subscribeToSubmittalProgress(
  submittalId: string,
  onProgress: (data: SubmittalProgressBO) => void,
  onComplete: (data: SubmittalCompleteBO) => void,
  onError: (error: string) => void
): EventSource {
  if (isMockApiEnabled) {
    return subscribeToMockSubmittalProgress(submittalId, onProgress, onComplete, onError);
  }

  const eventSource = new EventSource(`/api/submittals/${submittalId}/progress`);

  eventSource.addEventListener('progress', (event) => {
    try {
      const data = JSON.parse(event.data);
      onProgress(convertKeysToCamelCase<SubmittalProgressBO>(data));
    } catch {
      eventSource.close();
      onError('Failed to parse progress data');
    }
  });

  eventSource.addEventListener('complete', (event) => {
    try {
      const data = JSON.parse(event.data);
      onComplete(convertKeysToCamelCase<SubmittalCompleteBO>(data));
      eventSource.close();
    } catch {
      eventSource.close();
      onError('Failed to parse completion data');
    }
  });

  eventSource.addEventListener('error', (event: MessageEvent | Event) => {
    try {
      if ('data' in event && event.data) {
        const data = JSON.parse(event.data as string);
        const camelCaseData = convertKeysToCamelCase<{ errorMessage?: string }>(data);
        onError(camelCaseData.errorMessage || 'Analysis failed');
      } else {
        onError('Connection error occurred');
      }
    } catch {
      onError('An unexpected error occurred');
    } finally {
      eventSource.close();
    }
  });

  return eventSource;
}

export function unsubscribeFromSubmittalProgress(eventSource: EventSource): void {
  eventSource.close();
}
