// This is disabled due to properties coming from API.

import TenrxQuestionAPIModel from "./TenrxQuestionAPIModel.js";

/* eslint-disable @typescript-eslint/naming-convention */
export default interface TenrxLoginAPIModel {
  access_token: string;
  expires_in: number;
  data: TenrxLoginAPIModelData | TenrxQuestionAPIModel[] | Record<string, never>;
  message: string;
  statusCode: number;
  patientData: unknown;
  notifications: unknown;
  firstTimeLogin: boolean;
}

export interface TenrxLoginAPIModelData {
  id: number;
  userID: number;
  roleID: number;
  organizationID: number;
  userName: string;
  locationID: number;
  photoThumbNailPath: string;
}
