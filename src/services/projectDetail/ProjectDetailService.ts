import { client } from '@/client/mockClient.ts';
import { convertKeysToCamelCase } from '@/helpers/utilities/caseConverter.ts';
import { ServiceResult } from '@/types/common/ServiceResult.ts';
import { ServiceResultStatusENUM } from '@/types/enums/ServiceResultStatusENUM.ts';
import { ProjectDetailsResponseDTO } from './types/ProjectDetailsResponseDTO.ts';

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

  if (code === 401) {
    return {
      data: null,
      message: payload.message ?? 'Unauthorized',
      statusCode: ServiceResultStatusENUM.UNAUTHORIZED,
    };
  }

  return {
    data: null,
    message: payload.message ?? 'Request failed',
    statusCode: ServiceResultStatusENUM.ERROR,
  };
}

export async function getProjectDetails(
  projectId: string
): Promise<ServiceResult<ProjectDetailsResponseDTO>> {
  try {
    const response = await client(`/api/projects/${projectId}/details`, null, 'GET');
    const camelCaseData = convertKeysToCamelCase<
      ProjectDetailsResponseDTO & {
        code?: number;
        message?: string;
        data?: ProjectDetailsResponseDTO;
      }
    >(response.data);

    if ('project' in camelCaseData) {
      return {
        data: camelCaseData,
        message: 'Success',
        statusCode: ServiceResultStatusENUM.SUCCESS,
      };
    }

    const envelope = camelCaseData as {
      code?: number;
      data?: ProjectDetailsResponseDTO;
      message?: string;
    };

    return toServiceResult<ProjectDetailsResponseDTO>({
      code: envelope.code,
      data: envelope.data,
      message: envelope.message,
    });
  } catch {
    return {
      data: null,
      message: 'Failed to load project details',
      statusCode: ServiceResultStatusENUM.ERROR,
    };
  }
}

export async function deleteSubmittal(submittalId: string): Promise<ServiceResult<null>> {
  try {
    const response = await client(`/api/submittals/${submittalId}`, null, 'DELETE');
    const camelCaseData = convertKeysToCamelCase<{ code?: number; message?: string; data?: null }>(
      response.data
    );

    return toServiceResult<null>({
      code: camelCaseData.code,
      data: camelCaseData.data ?? null,
      message: camelCaseData.message,
    });
  } catch {
    return {
      data: null,
      message: 'Failed to delete submittal',
      statusCode: ServiceResultStatusENUM.ERROR,
    };
  }
}

export async function deleteSpecificationManual(documentId: string): Promise<ServiceResult<null>> {
  try {
    const response = await client(`/api/specification-documents/${documentId}`, null, 'DELETE');
    const camelCaseData = convertKeysToCamelCase<{ code?: number; message?: string; data?: null }>(
      response.data
    );

    return toServiceResult<null>({
      code: camelCaseData.code,
      data: camelCaseData.data ?? null,
      message: camelCaseData.message,
    });
  } catch {
    return {
      data: null,
      message: 'Failed to delete specification manual',
      statusCode: ServiceResultStatusENUM.ERROR,
    };
  }
}
