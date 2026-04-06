import { client } from '@/client/mockClient.ts';
import { convertKeysToCamelCase } from '@/helpers/utilities/caseConverter.ts';
import { ServiceResult } from '@/types/common/ServiceResult.ts';
import { ServiceResultStatusENUM } from '@/types/enums/ServiceResultStatusENUM.ts';
import { ProjectSetupDataDTO, ProjectSetupResponseDTO } from './types/ProjectSetupResponseDTO.ts';
import { SpecUploadDataDTO, SpecUploadResponseDTO } from './types/SpecUploadResponseDTO.ts';

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

export async function getProjectSetup(
  projectId: string
): Promise<ServiceResult<ProjectSetupDataDTO>> {
  try {
    const response = await client(`/api/projects/${projectId}/setup`, null, 'GET');
    const camelCaseData = convertKeysToCamelCase<ProjectSetupResponseDTO>(response.data);

    return toServiceResult<ProjectSetupDataDTO>({
      code: camelCaseData.code,
      data: camelCaseData.data,
      message: camelCaseData.message,
    });
  } catch {
    return {
      data: null,
      message: 'Failed to load project setup',
      statusCode: ServiceResultStatusENUM.ERROR,
    };
  }
}

export async function uploadSpecManual(
  formData: FormData
): Promise<ServiceResult<SpecUploadDataDTO>> {
  try {
    const response = await client('/api/spec-upload', formData, 'POST');
    const camelCaseData = convertKeysToCamelCase<SpecUploadResponseDTO>(response.data);

    return toServiceResult<SpecUploadDataDTO>({
      code: camelCaseData.code,
      data: camelCaseData.data,
      message: camelCaseData.message,
    });
  } catch {
    return {
      data: null,
      message: 'Failed to upload specification manual',
      statusCode: ServiceResultStatusENUM.ERROR,
    };
  }
}
