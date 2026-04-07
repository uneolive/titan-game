import { client } from '@/client/mockClient.ts';
import { convertKeysToCamelCase } from '@/helpers/utilities/caseConverter.ts';
import { ServiceResult } from '@/types/common/ServiceResult.ts';
import { ServiceResultStatusENUM } from '@/types/enums/ServiceResultStatusENUM.ts';
import { ProjectsListDataDTO, ProjectsListResponseDTO } from './types/ProjectsListResponseDTO.ts';

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

export async function getProjects(
  sortBy: string = 'project_name',
  sortOrder: string = 'asc'
): Promise<ServiceResult<ProjectsListDataDTO>> {
  try {
    const query = new URLSearchParams({
      sort_by: sortBy,
      sort_order: sortOrder,
    });
    const response = await client(`/api/projects?${query.toString()}`, null, 'GET');
    const camelCaseData = convertKeysToCamelCase<ProjectsListResponseDTO>(response.data);

    return toServiceResult<ProjectsListDataDTO>({
      code: camelCaseData.code,
      data: camelCaseData.data,
      message: camelCaseData.message,
    });
  } catch {
    return {
      data: null,
      message: 'Failed to load projects',
      statusCode: ServiceResultStatusENUM.ERROR,
    };
  }
}

export async function deleteProject(projectId: string): Promise<ServiceResult<null>> {
  try {
    const response = await client(`/api/projects/${projectId}`, null, 'DELETE');
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
      message: 'Failed to delete project',
      statusCode: ServiceResultStatusENUM.ERROR,
    };
  }
}
