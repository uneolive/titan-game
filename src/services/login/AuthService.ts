import { client } from '@/client/client.ts';
import { convertKeysToCamelCase } from '@/helpers/utilities/caseConverter.ts';
import { adaptApiResponse, serviceFailureResponse } from '@/helpers/utilities/serviceHelpers.ts';
import Logger from '@/helpers/utilities/Logger.ts';
import { ServiceResult } from '@/types/common/ServiceResult.ts';
import { ServiceResultStatusENUM } from '@/types/enums/ServiceResultStatusENUM.ts';
import { BASE_URL, ENDPOINTS, HTTP_METHOD } from '@/constants/apiConstants.ts';
import { LoginRequestDTO } from './types/LoginRequestDTO.ts';
import { LoginResponseDTO } from './types/LoginResponseDTO.ts';
import { isValidEmail } from '@/helpers/validators/emailValidator.ts';
import { isValidPassword } from '@/helpers/validators/passwordValidator.ts';

/**
 * User login with email and password
 * SEQ: 6.5 - Define async function login(email, password)
 */
export async function login(
  email: string,
  password: string
): Promise<ServiceResult<LoginResponseDTO>> {
  try {
    // Validate email format
    if (!isValidEmail(email)) {
      return {
        data: null,
        message: 'Please enter a valid email address',
        statusCode: ServiceResultStatusENUM.VALIDATION_ERROR,
      };
    }

    // Validate password
    if (!isValidPassword(password)) {
      return {
        data: null,
        message: 'Password must be at least 6 characters long',
        statusCode: ServiceResultStatusENUM.VALIDATION_ERROR,
      };
    }

    const endpoint = `${BASE_URL}${ENDPOINTS.LOGIN}`;
    const requestBody: LoginRequestDTO = { email, password };

    // SEQ: 6.8 - Call client with endpoint, requestBody, HTTP_METHOD.POST
    const response = await client(endpoint, requestBody, HTTP_METHOD.POST);

    // SEQ: 6.18 - Call convertKeysToCamelCase with response.data
    const camelCaseData = convertKeysToCamelCase<LoginResponseDTO>(response.data);

    return adaptApiResponse<LoginResponseDTO>({ ...response, data: camelCaseData });
  } catch (error) {
    Logger.error('Failed to login', {
      email,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return serviceFailureResponse<LoginResponseDTO>(
      null,
      'Login failed. Please check your credentials.'
    );
  }
}
