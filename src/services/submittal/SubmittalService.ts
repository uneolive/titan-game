import { client, fetchSSE } from '@/client/mockClient.ts';
import { convertKeysToCamelCase } from '@/helpers/utilities/caseConverter.ts';
import { ServiceResult } from '@/types/common/ServiceResult.ts';
import { ServiceResultStatusENUM } from '@/types/enums/ServiceResultStatusENUM.ts';
import { SpecSectionsDataDTO, SpecSectionsResponseDTO } from './types/SpecSectionsResponseDTO.ts';

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

  if (code === 400 || code === 422) {
    return {
      data: null,
      message: payload.message ?? 'Validation error',
      statusCode: ServiceResultStatusENUM.VALIDATION_ERROR,
    };
  }

  return {
    data: null,
    message: payload.message ?? 'Request failed',
    statusCode: ServiceResultStatusENUM.ERROR,
  };
}

export async function getSpecificationSections(
  projectId: string
): Promise<ServiceResult<SpecSectionsDataDTO>> {
  try {
    const response = await client(`/api/projects/${projectId}/sections`, null, 'GET');
    const camelCaseData = convertKeysToCamelCase<SpecSectionsResponseDTO>(response.data);

    return toServiceResult<SpecSectionsDataDTO>({
      code: camelCaseData.code,
      data: camelCaseData.data,
      message: camelCaseData.message,
    });
  } catch {
    return {
      data: null,
      message: 'Failed to load specification sections',
      statusCode: ServiceResultStatusENUM.ERROR,
    };
  }
}

export async function uploadSubmittal(formData: FormData, signal?: AbortSignal): Promise<Response> {
  const response = await fetchSSE('/api/submittal-assistant', formData, signal);

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }

  return response;
}
