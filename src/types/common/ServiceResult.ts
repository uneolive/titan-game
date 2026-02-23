import { ServiceResultStatusENUM } from '../enums/ServiceResultStatusENUM.ts';

export interface ServiceResult<T> {
  data: T | null;
  message: string;
  statusCode: ServiceResultStatusENUM;
}
