// MOCK: Import mock client for testing without backend
import { mockClient as client } from '@/client/mockClient.ts';
// REAL: Uncomment below line when backend is ready
// import { client } from '@/client/client.ts';

import { convertKeysToCamelCase } from '@/helpers/utilities/caseConverter.ts';
import { adaptApiResponse, serviceFailureResponse } from '@/helpers/utilities/serviceHelpers.ts';
import Logger from '@/helpers/utilities/Logger.ts';
import { ServiceResult } from '@/types/common/ServiceResult.ts';
import { ServiceResultStatusENUM } from '@/types/enums/ServiceResultStatusENUM.ts';
import { BASE_URL, ENDPOINTS, HTTP_METHOD } from '@/constants/apiConstants.ts';
import { ProjectSetupResponseDTO, ProjectSetupDataDTO } from './types/ProjectSetupResponseDTO.ts';
import { SpecUploadResponseDTO, SpecUploadDataDTO } from './types/SpecUploadResponseDTO.ts';

/**
 * Get project setup data for prepopulation
 */
export async function getProjectSetup(
  projectId: string
): Promise<ServiceResult<ProjectSetupDataDTO>> {
  try {
      const endpoint = `${BASE_URL}${ENDPOINTS.PROJECT_SETUP.replace(':projectId', projectId)}`;
      const response = await client(endpoint, null, HTTP_METHOD.GET);

      const camelCaseData = convertKeysToCamelCase<ProjectSetupResponseDTO>(response.data);

      if (camelCaseData.code === 200) {
      return adaptApiResponse<ProjectSetupDataDTO>({ ...response, data: camelCaseData });
    } else if (camelCaseData.code === 404) {
      return {
        data: null,
        message: 'Project not found',
        statusCode: ServiceResultStatusENUM.ERROR,
      };
    } else {
      return {
        data: null,
        message: camelCaseData.message,
        statusCode: ServiceResultStatusENUM.ERROR,
      };
    }
  } catch (error) {
      Logger.error('Service exception in getProjectSetup', {
      projectId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
      return serviceFailureResponse<ProjectSetupDataDTO>(null, 'Failed to load project setup');
  }
}

/**
 * Upload specification manual
 */
export async function uploadSpecManual(
  formData: FormData
): Promise<ServiceResult<SpecUploadDataDTO>> {
  try {
      const endpoint = `${BASE_URL}${ENDPOINTS.SPEC_UPLOAD}`;
      const response = await client(endpoint, formData, HTTP_METHOD.POST);

      const camelCaseData = convertKeysToCamelCase<SpecUploadResponseDTO>(response.data);

      if (camelCaseData.code === 200) {
      return adaptApiResponse<SpecUploadDataDTO>({ ...response, data: camelCaseData });
    } else if (camelCaseData.code === 400 || camelCaseData.code === 422) {
      return {
        data: null,
        message: camelCaseData.message,
        statusCode: ServiceResultStatusENUM.VALIDATION_ERROR,
      };
    } else if (camelCaseData.code === 500) {
      return {
        data: null,
        message: camelCaseData.message,
        statusCode: ServiceResultStatusENUM.SERVER_ERROR,
      };
    } else {
      return {
        data: null,
        message: camelCaseData.message,
        statusCode: ServiceResultStatusENUM.ERROR,
      };
    }
  } catch (error) {
      Logger.error('Service exception in uploadSpecManual', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
      return serviceFailureResponse<SpecUploadDataDTO>(null, 'Failed to upload specification manual');
  }
}


