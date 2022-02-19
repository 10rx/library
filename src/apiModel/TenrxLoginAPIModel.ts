// This is disabled due to properties coming from API.

import TenrxQuestionAPIModel from "./TenrxQuestionAPIModel.js";

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
  id: number;
  userID: number;
  roleID: number;
  organizationID: number;
  userName: string;
  locationID: number;
  photoThumbNailPath: string;
}

export interface TenrxLoginAPIModelPatientData {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  emailAddress: string;
  ssn: string;
  mrn: string;
  aptnumber: string;
  address1: string;
  address2: string;
  city: string;
  zipCode: string;
  phoneNumber: string;
  healthPlanBeneficiaryNumber: string;
  countryId: number;
  stateId: number;
  stateName: string;
  country: string;
  gender: number;
}
