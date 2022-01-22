// This is disabled due to properties coming from API.
/* eslint-disable @typescript-eslint/naming-convention */
export default interface TenrxLoginAPIModel {
  access_token: string;
  expires_in: number;
  data: unknown;
  message: string;
  statusCode: number;
  patientData: unknown;
  notifications: unknown;
  firstTimeLogin: boolean;
}
