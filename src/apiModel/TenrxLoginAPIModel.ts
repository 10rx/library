// This is disabled due to properties coming from API.

import TenrxQuestionAPIModel from './TenrxQuestionAPIModel.js';

/* eslint-disable @typescript-eslint/naming-convention */
export default interface TenrxLoginAPIModel {
  access_token: string;
  expires_in: number;
  data: TenrxLoginAPIModelData | TenrxQuestionAPIModel[] | Record<string, never>;
  message: string;
  statusCode: number;
  patientData: TenrxLoginAPIModelPatientData | null;
  notifications: unknown;
  firstTimeLogin: boolean;
}

export interface TenrxLoginAPIModelData {
  roleID: number;
  organizationID: number;
  emailId: string;
  locationID: number;
  photoThumbNailPath: string;
}

export interface TenrxLoginAPIModelPatientData {
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  emailId: string;
  ssn: string;
  mrn: string;
  aptnumber: string;
  address1: string;
  address2: string;
  city: string;
  zipCode: string;
  phoneNumber: string;
  patienUniqueIdentifer: string;
  countryId: number;
  stateId: number;
  state: string;
  country: string;
  gender: number;
  photoPath: string;
  photoThumbnailPath: string;
}
