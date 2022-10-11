/* eslint-disable @typescript-eslint/naming-convention */
import axios, { AxiosInstance, AxiosError } from 'axios';
import { TenrxLibraryLogger } from '../includes/TenrxLogging.js';
import TenrxApiResult from '../types/TenrxApiResult.js';
import TenrxNotInitialized from '../exceptions/TenrxNotInitialized.js';
import TenrxAccessTokenInvalid from '../exceptions/TenrxAccessTokenInvalid.js';
import TenrxAccessTokenExpired from '../exceptions/TenrxAccessTokenExpired.js';
import TenrxLoginAPIModel from '../apiModel/TenrxLoginAPIModel.js';
import TenrxSaveUserSecurityQuestionAPIModel from '../apiModel/TenrxSaveUserSecurityQuestionAPIModel.js';
import TenrxRegisterUserParameterAPIModel from '../apiModel/TenrxRegisterUserParameterAPIModel.js';
import TenrxUpdatePatientDetailsAPIModel from '../apiModel/TenrxUpdatePatientDetailsAPIModel.js';
import TenrxChargeAPIModel from '../apiModel/TenrxChargeAPIModel.js';
import TenrxSaveProductAPIModel from '../apiModel/TenrxSaveProductAPIModel.js';
import TenrxGuestAddProductAPIModel from '../apiModel/TenrxGuestAddProductAPIModel.js';
import TenrxQuestionnaireSaveAnswersAPIModel from '../apiModel/TenrxQuestionnaireSaveAnswersAPIModel.js';
import TenrxQuestionnaireSurveyResponseAPIModel from '../apiModel/TenrxQuestionnaireSurveyResponsesAPIModel.js';
import TenrxAccessTokenExpirationInformation from '../types/TenrxAccessTokenExpirationInformation.js';
import TenrxUpdatePatientInfoAPIModel from '../apiModel/TenrxUpdatePatientInfoAPIModel.js';
import TenrxUploadPatientAffectedImagesAPIModel from '../apiModel/TenrxUploadPatientAffectedImagesAPIModel.js';
import { DateTime } from 'luxon';
import TenrxRegisterGuestParameterAPIModel from '../apiModel/TenrxRegisterGuestParameterAPIModel.js';
import TenrxGetProductTaxAPIModel from '../apiModel/TenrxGetProductTaxAPIModel.js';
import TenrxSessionDetailsAPIModel from '../apiModel/TenrxSessionDetailsAPIModel.js';
import TenrxCheckoutAPIModel from '../apiModel/TenrxCheckoutAPIModel.js';
import { TenrxUploadStagingImage, TenrxAPIModel, TenrxRefillModel } from '../index.js';

/**
 * Represents a Tenrx API engine.
 *
 * @export
 * @class TenrxApiEngine - A class that represents a Tenrx API engine.
 */
export default class TenrxApiEngine {
  private accesstoken: string;
  private expiresIn: number;
  private expireDateStart: number;
  private axios: AxiosInstance;

  private static _instance: TenrxApiEngine | null = null;

  /**
   * Creates an instance of TenrxApiEngine.
   *
   * @param {string} businesstoken - The business token to use for the API engine
   * @param {string} baseapi - The base api url to use for the API engine
   * @memberof TenrxApiEngine
   */
  constructor(businesstoken: string, baseapi: string) {
    TenrxLibraryLogger.silly('Creating a new TenrxApiEngine: ', { businesstoken, baseapi });
    this.accesstoken = '';
    this.expiresIn = -1;
    this.expireDateStart = 0;
    this.axios = axios.create({
      baseURL: baseapi,
      headers: {
        businessToken: businesstoken,
      },
    });
  }

  /**
   * Gets the appointments for the current patient identified by the access token.
   *
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async getAppointmentsForPatient(): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Getting appointments for patient from API');
    try {
      const response = this.authGet(`/api/v1/Patient/GetAppointmentsForPatient`);
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('getAppointmentsForPatient() Error: ', error);
      const response: TenrxApiResult = {
        status: 500,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Joins the meeting for a given order number.
   *
   * @param {string} orderNumber - The order number to join the meeting for.
   * @return {*}  {Promise<TenrxApiResult>} - The response from the API.
   * @memberof TenrxApiEngine
   */
  public async joinMeeting(orderNumber: string): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Joining meeting from API');
    try {
      const response = this.authPost(`/api/v1/Meeting/JoinMeeting`, {
        orderNumber,
      });
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('joinMeeting() Error: ', error);
      const response: TenrxApiResult = {
        status: 500,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Creates an appointment for the given order.
   *
   * @param {string} orderId - The order id to create the appointment for.
   * @param {Date} startDate - The start date to create the appointment for.
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async createAppointment(orderId: string, startDate: Date): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Creating appointment from API');
    try {
      const response = this.authPost(`/api/v1/Patient/CreateAppointment`, {
        orderNumber: orderId,
        appointmentDateTime: DateTime.fromJSDate(startDate).toUTC().toISO({ suppressMilliseconds: true }),
      });
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('createAppointment() Error: ', error);
      const response: TenrxApiResult = {
        status: 500,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Gets the doctor's available times for a specific date given an specific number.
   *
   * @param {string} orderId - The order id to get the available times for.
   * @param {Date} startDate - The start date to get the available times for.
   * @param {Date} endDate - The end date to get the available times for.
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async getDoctorAvailabilityForPatient(
    orderId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Getting doctor availability for patient from API');
    try {
      const response = this.authPost(`/api/v1/Patient/GetDoctorAvailablityForPatient`, {
        orderNumber: orderId,
        startDate: DateTime.fromJSDate(startDate).toUTC().toISO({ suppressMilliseconds: true }),
        endDate: DateTime.fromJSDate(endDate).toUTC().toISO({ suppressMilliseconds: true }),
      });
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('getDoctorAvailabilityForPatient() Error: ', error);
      const response: TenrxApiResult = {
        status: 500,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Gets the current access token expiration information.
   *
   * @return {*}  {{ expiresIn: number, expireDateStart: number }}
   * @memberof TenrxApiEngine
   */
  public getAccessTokenExpirationInformation(): TenrxAccessTokenExpirationInformation {
    return {
      expiresIn: this.expiresIn,
      expireDateStart: this.expireDateStart,
    };
  }

  /**
   * Sets the access token to be used by the API Engine
   *
   * @param {string} accesstoken - The access token to use
   * @param {number} expireDateStart - The date that the expire date starts
   * @param {number} expiresIn - The amount of time that the token is valid for
   * @memberof TenrxApiEngine
   */
  public setAccessToken(accesstoken: string, expireDateStart: number, expiresIn: number) {
    this.accesstoken = accesstoken;
    this.expiresIn = expiresIn;
    this.expireDateStart = expireDateStart;
  }

  /**
   * Gets the states valid for prescriptions from the backend server.
   *
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async getStatesValidForRx(): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Getting states valid for rx from API');
    try {
      const response = await this.get(`/Login/GetStatesValidForRX`);
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('getStatesValidForRx() Error: ', error);
      const response: TenrxApiResult = {
        status: 500,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Gets all the orders from the current patient. The api engine and backend servers uses the current token to determine which patient profile to get.
   *
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async getPatientOrders(): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Getting patient orders from API');
    try {
      const response = this.authGet(`/api/v1/Patient/GetPatientOrdersV1`);
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('getPatientOrders() Error: ', error);
      const response: TenrxApiResult = {
        status: 500,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Saves questionnaire answers to the backend server.
   *
   * @param {string} orderNumber - The order number to save the answers for
   * @param {string} patientComment - The comment that the patient has made
   * @param {boolean} paymentStatus - The payment status of the order. True if paid, false if not.
   * @param {TenrxQuestionnaireSurveyResponseAPIModel[]} surveyResponses
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async saveAnswers(
    orderNumber: string,
    patientComment: string,
    paymentStatus: boolean,
    surveyAnswers: TenrxQuestionnaireSurveyResponseAPIModel[],
  ): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Saving answers to API');
    const answers: TenrxQuestionnaireSaveAnswersAPIModel = {
      surveyAnswers,
      orderNumber,
      patientComment,
      paymentStatus,
    };
    try {
      const response = await this.authPost(`/api/v1/Questionnaire/SaveAnswers`, answers);
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('SaveAnswers() Error: ', error);
      const response: TenrxApiResult = {
        status: 500,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Gets the current patient profile data. The api engine and backend servers uses the current token to determine which patient profile to get.
   *
   * @return {*}
   * @memberof TenrxApiEngine
   */
  public async getPatientProfileData() {
    TenrxLibraryLogger.silly('Getting patient profile data');
    try {
      const response = await this.authGet(`/api/v1/Patient/GetPatientProfileData`);
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('getPatientProfileData() Error: ', error);
      const response: TenrxApiResult = {
        status: 500,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Gets the questionnaire from the backend server.
   *
   * @param {{ visitTypeId: number }[]} visitTypeId - The visit type to get the questionnaire for
   * @param {number} [questionnaireCategoryID=0] - The questionnaire category to get the questionnaire for
   * @param {number} [templateId=0] - The template to get the questionnaire for
   * @return {*}  {Promise<TenrxApiResult>} - The response from the API
   * @memberof TenrxApiEngine
   */
  public async getQuestionList(
    visitTypeId: { visitTypeId: number }[],
    questionnaireCategoryID = 0,
    templateId = 0,
  ): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Getting question list from API');
    try {
      const response = await this.post(`/Login/GetQuestionList`, {
        id: 0,
        visitTypeId,
        questionnaireCategoryID,
        templateId,
      });
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('getQuestionList() Error: ', error);
      const response: TenrxApiResult = {
        status: 500,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Gets the payment cards for the current user.
   *
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async getPaymentCardByUser(): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Getting payment cards from API');
    try {
      const response = await this.authGet(`/api/v1/Payment/GetPaymentCardByUser`);
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('getPaymentCardByUser() Error: ', error);
      const response: TenrxApiResult = {
        status: 500,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Places an order to the current user account authenticated.
   *
   * @param {TenrxGuestAddProductAPIModel} order - The order to place
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async authPlaceOrder(order: TenrxGuestAddProductAPIModel): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Placing order to API (auth)');
    try {
      const response = await this.authPost(`/Patients/GuestAddProduct`, order);
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('AuthPlaceOrder() Error: ', error);
      const response: TenrxApiResult = {
        status: 500,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Places an order to the current user account unauthenticated.
   *
   * @param {TenrxGuestAddProductAPIModel} order - The order to place
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async placeOrder(order: TenrxGuestAddProductAPIModel): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Placing order to API');
    try {
      const response = await this.post(`/Login/GuestAddProduct`, order);
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('placeOrder() Error: ', error);
      const response: TenrxApiResult = {
        status: 500,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Places an order to the current user account authenticated.
   *
   * @param {TenrxSaveProductAPIModel} order - The order to place
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async authSaveProduct(order: TenrxSaveProductAPIModel): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Saving product to API (auth)');
    try {
      const response = await this.authPost(`/api/v1/Patient/SaveProduct`, order);
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('AuthSaveProduct() Error: ', error);
      const response: TenrxApiResult = {
        status: 500,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Gets information regarding a promotion given a coupon code.
   *
   * @param {string} couponCode - The coupon code of the promotion.
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async getPromotionInformation(couponCode: string): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Getting coupon information from API');
    try {
      const response = await this.get(`/api/v1/Product/GetCouponCode`, { couponCode });
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('getCouponInformation() Error: ', error);
      const response: TenrxApiResult = {
        status: 500,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Gets the product tax information for a given shipping address from the API.
   *
   * @param {TenrxGetProductTaxAPIModel} data - The data to get the tax information for.
   * @return {*}
   * @memberof TenrxApiEngine
   */
  public async getProductTax(data: TenrxGetProductTaxAPIModel) {
    TenrxLibraryLogger.silly('Getting product tax from API');
    try {
      const response = await this.post(`/api/v1/Product/GetProductTax`, data);
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('getProductTax() Error: ', error);
      const response: TenrxApiResult = {
        status: 500,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Places an order to the current user account unauthenticated.
   *
   * @param {TenrxSaveProductAPIModel} order - The order to place
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async saveProduct(order: TenrxSaveProductAPIModel): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Saving product to API');
    try {
      const response = await this.post(`/api/v1/Login/SaveProduct`, order);
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('SaveProduct() Error: ', error);
      const response: TenrxApiResult = {
        status: 500,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Checkout the cart
   *
   * @param {TenrxCheckoutAPIModel} charge - Cart object with payment details
   * @param {number} [timeout=10000] - Request timeout
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async authSavePaymentDetails(charge: TenrxCheckoutAPIModel, timeout = 10000): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Saving payment details to API (auth)');
    try {
      const response = await this.authPost(`/api/v1/Payment/SavePaymentDetails`, charge, {}, {}, timeout);
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('AuthSavePaymentDetails() Error: ', error);
      const response: TenrxApiResult = {
        status: 500,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Pays for a charge without authentication.
   *
   * @param {TenrxChargeAPIModel} charge - The charge to pay for
   * @param {number} [timeout=10000] - Request timeout
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async savePaymentDetails(charge: TenrxChargeAPIModel, timeout = 10000): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Saving payment details to API');
    try {
      const response = await this.post(`/api/v1/Login/SavePaymentDetails`, charge, {}, {}, timeout);
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('SavePaymentDetails() Error: ', error);
      const response: TenrxApiResult = {
        status: 500,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Register a new guest user to Tenrx
   *
   * @param {TenrxRegisterGuestParameterAPIModel} guest - The guest to register
   * @return {*}  {Promise<TenrxApiResult>} - The result of the registration API call
   * @memberof TenrxApiEngine
   */
  public async registerGuest(guest: TenrxRegisterGuestParameterAPIModel): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Registering guest to API');
    try {
      const response = await this.post(`/Login/RegisterGuest`, guest);
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('registerGuest() Error: ', error);
      const response: TenrxApiResult = {
        status: 500,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Registers a new user to Tenrx
   *
   * @param {TenrxRegisterUserParameterAPIModel} registrationData - Contains the registration information
   * @return {*}  {Promise<TenrxApiResult>} - The result of the API call
   * @memberof TenrxApiEngine
   */
  public async registerUser(registrationData: TenrxRegisterUserParameterAPIModel): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Registering user with backend servers');
    try {
      const response = await this.post(`/Login/RegisterPatient`, registrationData);
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('RegisterUser() Error: ', error);
      const response: TenrxApiResult = {
        status: 500,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Updates the patient details in the API.
   *
   * @param {TenrxUpdatePatientDetailsAPIModel} details - The details to update
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async updatePatientDetails(details: TenrxUpdatePatientDetailsAPIModel): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Saving patient details to API');
    try {
      const response = await this.authPost(`/Patients/UpdatePatientDetails`, details);
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('updatePatientDetails() Error: ', error);
      const response: TenrxApiResult = {
        status: 0,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Saves the security question answers for the user.
   *
   * @param {TenrxSaveUserSecurityQuestionAPIModel} securityQuestionAnswers - The security question answers to save
   * @return {*}  {Promise<TenrxApiResult>} - The result of the API call
   * @memberof TenrxApiEngine
   */
  public async saveSecurityQuestionAnswers(
    securityQuestionAnswers: TenrxSaveUserSecurityQuestionAPIModel,
  ): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Saving security question answers to API');
    try {
      const response = await this.post(`/Login/SaveUserSecurityQuestion`, securityQuestionAnswers);
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('SaveSecurityQuestionAnswers() Error: ', error);
      const response: TenrxApiResult = {
        status: 0,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Check to see if email exists in the API.
   *
   * @param {string} email - The email to check
   * @return {*}  {Promise<TenrxApiResult>} - The result of the API call
   * @memberof TenrxApiEngine
   */
  public async checkIsEmailExists(email: string): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Checking if email exists: ', email);
    try {
      // API is missing the S in the URL. Therefore it is CheckIsEmailExist instead of CheckIsEmailExists.
      // Also, for some reason, this is a post request instead of a get request.
      const response = await this.post(`/Login/CheckIsEmailExist`, {}, {}, { email });
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('CheckIsEmailExists() Error: ', error);
      const response: TenrxApiResult = {
        status: 500,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Logs out the TenrxApiEngine instance
   *
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async logout(): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Logging out user from API');
    try {
      const response = await this.authPatch(`/Login/Logout`);
      this.accesstoken = '';
      this.expiresIn = -1;
      this.expireDateStart = 0;
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('Logout() Error: ', error);
      const response: TenrxApiResult = {
        status: -1,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Returns true of the Api engine is authenticated. Otherwise, it returns false.
   *
   * @readonly
   * @type {boolean}
   * @memberof TenrxApiEngine
   */
  public get isAuthenticated(): boolean {
    try {
      this.ensureValidAccessToken();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Ensures that the access token is valid
   *
   * @private
   * @memberof TenrxApiEngine
   * @throws {TenrxAccessTokenInvalid} - Throws an exception if the access token is invalid. The invalid value is contained in the exception.
   * @throws {TenrxAccessTokenExpired} - Throws an exception if the access token is expired. The expired values are contained in the exception.
   */
  private ensureValidAccessToken(): void {
    TenrxLibraryLogger.silly('Ensuring valid access token');
    if (this.accesstoken === '') {
      TenrxLibraryLogger.silly('Access Token is empty:', this.accesstoken);
      throw new TenrxAccessTokenInvalid('Access Token is empty.', this.accesstoken);
    }
    if (this.expiresIn < 0) {
      TenrxLibraryLogger.silly('Expires In is not valid:', this.expiresIn);
      throw new TenrxAccessTokenInvalid('Expires In is not valid.', this.expiresIn);
    }
    if (this.expireDateStart === 0) {
      TenrxLibraryLogger.silly('Expire Date Start is not valid:', this.expireDateStart);
      throw new TenrxAccessTokenInvalid('Expire Date Start is not valid.', this.expireDateStart);
    }
    const now: number = Date.now();
    if (now > this.expireDateStart + this.expiresIn * 1000) {
      TenrxLibraryLogger.silly('Access Token has expired:', {
        expireDateStart: this.expireDateStart,
        expiresIn: this.expiresIn,
        now,
      });
      throw new TenrxAccessTokenExpired('Access Token has expired.', this.expireDateStart, this.expiresIn, now);
    }
    TenrxLibraryLogger.silly('Access Token is valid.');
  }

  /**
   * Uploads photos or images of the current patient determined by the access token to the API.
   *
   * @param {TenrxUploadPatientAffectedImagesAPIModel} details - The details of the photos to upload
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async uploadPatientAffectedImages(details: TenrxUploadPatientAffectedImagesAPIModel): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Uploading patient affected images to API');
    try {
      const response = await this.authPost(`/api/v1/Patient/UploadPatientAffectedImages`, details);
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('uploadPatientAffectedImages() Error: ', error);
      const response: TenrxApiResult = {
        status: 0,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Update patient information in the API
   *
   * @param {TenrxUpdatePatientInfoAPIModel} details - The patient information to update
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async updatePatientInfo(details: TenrxUpdatePatientInfoAPIModel): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Saving patient info to API');
    try {
      const response = await this.authPost(`/api/v1/Patient/UpdatePatientInfo`, details);
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('updatePatientInfo() Error: ', error);
      const response: TenrxApiResult = {
        status: 0,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Refreshes the current access token in the engine.
   *
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async refreshToken(): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Refreshing access token');
    try {
      const response = await this.authGet(`/api/v1/Common/RefreshToken`);
      this.processLoginResponse(response, 'refreshToken()');
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('RefreshToken() Error: ', error);
      const response: TenrxApiResult = {
        status: -1,
        content: null,
        error,
      };
      return response;
    }
  }

  public processLoginResponse(response: TenrxApiResult, callerForLogPurposes: string): void {
    if (response && response.status === 200) {
      TenrxLibraryLogger.silly(`${callerForLogPurposes} Response: `, response.content);
      if (response.content) {
        const content = response.content as TenrxLoginAPIModel;
        if (content.data) {
          if (content.access_token) {
            this.setAccessToken(content.access_token, Date.now(), Math.ceil(content.expires_in));
            TenrxLibraryLogger.silly(
              `${callerForLogPurposes} Updated Access Token in API Engine: ******* Expires In: `,
              this.expiresIn,
            );
          } else {
            TenrxLibraryLogger.silly(`${callerForLogPurposes} No Access Token in API Response`);
          }
        } else {
          TenrxLibraryLogger.error(
            `${callerForLogPurposes} API returned data as null when logging in. Content of error is: `,
            response.error,
          );
        }
      } else {
        TenrxLibraryLogger.error(
          `${callerForLogPurposes} API returned content as null when logging in. Content of error is: `,
          response.error,
        );
      }
    } else {
      TenrxLibraryLogger.error(`${callerForLogPurposes} Error: `, response.error);
    }
  }

  /**
   * Authenticates the TenrxApiEngine instance
   *
   * @param {string} username
   * @param {string} password
   * @param {string} [language='en']
   * @param {string} [macaddress='up:da:te:la:te:rr']
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async login(
    username: string,
    password: string,
    language = 'en',
    macaddress = 'up:da:te:la:te:rr',
  ): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Logging in user to API: ', { username, password, language, macaddress });
    try {
      const response: TenrxApiResult = await this.post(`/Login/PatientLogin`, {
        username,
        password,
        macaddress,
        language,
      });
      this.processLoginResponse(response, 'login()');
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('Login() Error: ', error);
      const response: TenrxApiResult = {
        status: 0,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Gets all the visit types
   *
   * @return {*}  {Promise<TenrxApiResult>} - All the visit types
   * @memberof TenrxApiEngine
   */
  public async getVisitTypes(): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Getting all the visit types from API');
    try {
      const response = await this.get(`/Login/GetVisitTypes`);
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('GetVisitTypes() Error: ', error);
      const response: TenrxApiResult = {
        status: 0,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Gets the product category by visit Id.
   *
   * @param {number} visitId - The id of the product category
   * @return {*}  {Promise<TenrxApiResult>} - The result of the product category API call.
   * @memberof TenrxApiEngine
   */
  public async getProductCategories(visitId: number): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Getting all the product category from API');
    try {
      const response = await this.get(`/Login/GetProductCategory`, {
        // This is due to the API requiring this value to be like this.
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Id: visitId.toString(),
      });
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('GetProductCategory() Error: ', error);
      const response: TenrxApiResult = {
        status: 0,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Gets the gender category by visit Id.
   *
   * @param {number} visitId
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async getGenderCategories(visitId: number): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Getting all the Gender category from API');
    try {
      const response = await this.get(`/Login/GetGenderCategory`, {
        // This is due to the API requiring this value to be like this.
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Id: visitId.toString(),
      });
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('getGenderCategories() Error: ', error);
      const response: TenrxApiResult = {
        status: 0,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Gets the product list from treatment.
   *
   * @param {number} treatmentTypeId - The id of the treatment type
   * @param {number} [categoryId=0] - The id of the product category
   * @param {number} [productId=0] - The id of the product
   * @param {number} [genderId=0] - The id of the gender
   * @param {string} [searchKey=''] - The search key to use to find the product
   * @param {boolean} [isWebRequest=true] - True if the request comes from the website
   * @param {number} [pageNumber=1] - The page number to get
   * @param {number} [pageSize=10] - The page size to get
   * @param {string} [sortColumn=''] - The column to sort by
   * @param {string} [sortOrder=''] - The order to sort by
   * @param {string} [language='en'] - The language to use
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async getTreatmentProductList(
    treatmentTypeId: number,
    categoryId = 0,
    productId = 0,
    genderId = 0,
    searchKey = '',
    isWebRequest = true,
    pageNumber = 1,
    pageSize = 10,
    sortColumn = '',
    sortOrder = '',
    language = 'en',
  ): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Getting all the Treatment ProductList from API');
    try {
      const response = await this.post(`/Login/getTreatmentProductList`, {
        // This is due to the API requiring this value to be like this.
        // eslint-disable-next-line @typescript-eslint/naming-convention
        treatmentTypeId,
        categoryId,
        productId,
        genderId,
        searchKey,
        isWebRequest,
        pageNumber,
        pageSize,
        sortColumn,
        sortOrder,
        language,
      });
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('getTreatmentProductList() Error: ', error);
      const response: TenrxApiResult = {
        status: 0,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Gets product details by id.
   *
   * @param {number} id
   * @return {*}  {Promise<TenrxApiResult>} - The response of the GET request.
   * @memberof TenrxApiEngine
   */
  public async getMedicationProductDetail(id: number): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Getting all the Medication Product Detail from API');
    try {
      const response = await this.get(`/Login/GetMedicationProductDetails`, {
        // This is due to the API requiring this value to be like this.
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Id: id.toString(),
      });
      return response;
    } catch (error) {
      TenrxLibraryLogger.error('GetMedicationProductDetails() Error: ', error);
      const response: TenrxApiResult = {
        status: 0,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Open up a chat session for the patient
   *
   * @param {(1 | 2)} chatType - The chat type. 1 for doctor 2 for pharma
   * @param {string} orderID
   * @return {*}  {(Promise<{ url: string; sessionID: number; sessionKey: string; error: any | null }>)}
   * @memberof TenrxApiEngine
   */
  public async getPatientChatSessionDetails(
    chatType: 1 | 2,
    orderID: string,
  ): Promise<{ url: string; sessionID: string; sessionKey: string; error: any | null }> {
    try {
      // The backend wants it as a query for whatever reason
      const response = await this.authPost(`/api/v1/Chat/OpenUserChatSession`, {}, undefined, {
        OrderNumber: orderID, // eslint-disable-line @typescript-eslint/naming-convention -- backend doesn't want camel case
        ChatRoom: `${chatType}`, // eslint-disable-line @typescript-eslint/naming-convention -- backend doesn't want camel case
      });

      const details: { url: string; sessionID: string; sessionKey: string; error: any | null } = {
        url: '',
        sessionID: '',
        sessionKey: '',
        error: null,
      };

      if (response.status !== 200) {
        details.error = response.error;
        return details;
      }
      const content = response.content as TenrxSessionDetailsAPIModel;
      if (content.apiStatus.statusCode !== 200) {
        details.error = content.apiStatus.message;
        return details;
      }

      if (content.data) {
        details.url = content.data.chatUrl;
        details.sessionID = content.data.chatSession.sessionID;
        details.sessionKey = content.data.chatSession.sessionKey;
        return details;
      }
      details.error = 'No Data';
      return details;
    } catch (error) {
      return {
        url: '',
        sessionID: '',
        sessionKey: '',
        error,
      };
    }
  }

  /**
   * Open up a chat session for the staff
   *
   * @param {(1 | 2)} chatType - The chat type. 1 for doctor 2 for pharma
   * @param {string} orderID - The ID of the order the chat session is for
   * @param {string} authToken - The auth token of staff member
   * @return {*}  {(Promise<{ url: string; sessionID: number; sessionKey: string; error: any | null }>)}
   * @memberof TenrxApiEngine
   */
  public async getStaffChatSessionDetails(
    chatType: 1 | 2,
    orderID: string,
    authToken: string,
  ): Promise<{ url: string; sessionID: string; sessionKey: string; error: any | null }> {
    try {
      // The backend wants it as a query for whatever reason
      const response = await this.post(
        `/api/v1/admin/Chat/OpenStaffChatSession`,
        {},
        {
          authorization: authToken,
        },
        {
          OrderNumber: orderID, // eslint-disable-line @typescript-eslint/naming-convention -- backend doesn't want camel case
          ChatRoom: `${chatType}`, // eslint-disable-line @typescript-eslint/naming-convention -- backend doesn't want camel case
        },
      );

      const details: { url: string; sessionID: string; sessionKey: string; error: any | null } = {
        url: '',
        sessionID: '',
        sessionKey: '',
        error: null,
      };

      if (response.status !== 200) {
        details.error = response.error;
        return details;
      }
      const content = response.content as TenrxSessionDetailsAPIModel;
      if (content.apiStatus.statusCode !== 200) {
        details.error = content.apiStatus.message;
        return details;
      }

      if (content.data) {
        details.url = content.data.chatUrl;
        details.sessionID = content.data.chatSession.sessionID;
        details.sessionKey = content.data.chatSession.sessionKey;
        return details;
      }
      details.error = 'No Data';
      return details;
    } catch (error) {
      return {
        url: '',
        sessionID: '',
        sessionKey: '',
        error,
      };
    }
  }

  /**
   * Request a password reset token
   *
   * @param {string} emailAddress - Email address of user
   * @param {string} forgotURL - The url that'll be used to give new password
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async forgotPassword(emailAddress: string, forgotURL: string): Promise<TenrxApiResult> {
    try {
      return await this.post(`/api/v1/Login/ForgotPassword`, {
        userName: emailAddress,
        forgotPasswordUrl: forgotURL,
      });
    } catch (error) {
      TenrxLibraryLogger.error('forgotPassword() Error: ', error);
      const response: TenrxApiResult = {
        status: 0,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Reset users password
   *
   * @param {string} emailAddress - Email address of user
   * @param {string} token - The provided token used for reset
   * @param {string} password - The hashed password
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async resetPassword(emailAddress: string, token: string, password: string): Promise<TenrxApiResult> {
    try {
      return await this.post(`/api/v1/Login/ResetUserPassword`, {
        userName: emailAddress,
        token,
        newPassword: password,
      });
    } catch (error) {
      TenrxLibraryLogger.error('resetPassword() Error: ', error);
      const response: TenrxApiResult = {
        status: 0,
        content: null,
        error,
      };
      return response;
    }
  }

  /**
   * Get details for an order
   *
   * @param {string} orderID
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async getOrderDetails(orderID: string): Promise<TenrxApiResult> {
    try {
      return await this.authGet('/api/v1/Patient/GetPatientOrderDetails', { orderNumber: orderID });
    } catch (error) {
      TenrxLibraryLogger.error('getOrderDetails() Error: ', error);
      return {
        status: 0,
        content: null,
        error,
      };
    }
  }

  /**
   * Get all refills for a patient
   *
   * @return {*}  {Promise<TenrxAPIModel<TenrxRefillModel[]>>}
   * @memberof TenrxApiEngine
   */
  public async getRefills(): Promise<TenrxAPIModel<TenrxRefillModel[]>> {
    try {
      const response = await this.authGet('/api/v1/Patient/GetRefills');
      const content = response.content as TenrxAPIModel<TenrxRefillModel[]>;
      return {
        apiStatus: content.apiStatus,
        data: content.data,
      };
    } catch (error) {
      TenrxLibraryLogger.error('getRefills() Error: ', error);
      return {
        apiStatus: {
          statusCode: 0,
          message: error as string,
          appError: '',
        },
        data: [],
      };
    }
  }

  /**
   * Upload images to staging
   *
   * @param {TenrxUploadStagingImage[]} images
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async uploadStagingImages(images: TenrxUploadStagingImage[]): Promise<TenrxApiResult> {
    try {
      return await this.authPost('/api/v1/Patient/UploadStagingImages', images);
    } catch (error) {
      TenrxLibraryLogger.error('uploadStagingImages() Error: ', error);
      return {
        status: 0,
        content: null,
        error,
      };
    }
  }

  /**
   * Get products
   *
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async getProducts(): Promise<TenrxApiResult> {
    try {
      return await this.get('/api/v1/Product/GetProducts');
    } catch (error) {
      TenrxLibraryLogger.error('getProducts() Error: ', error);
      return {
        status: 0,
        content: null,
        error,
      };
    }
  }

  /**
   * Get product
   *
   * @param {(string | number)} ID
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async getProduct(ID: string | number): Promise<TenrxApiResult> {
    try {
      return await this.get(`/api/v1/Product/GetProduct/${ID}`);
    } catch (error) {
      TenrxLibraryLogger.error('getProduct() Error: ', error);
      return {
        status: 0,
        content: null,
        error,
      };
    }
  }

  /**
   * Performs an authenticated GET request to the specified url.
   *
   * @param {string} url - The url to perform the GET request to.
   * @param {Record<string, string>} [params={}] - The parameters to add to the url.
   * @param {object} [headers={}] - The headers to add to the request.
   * @return {*}  {Promise<TenrxApiResult>} - The response of the GET request.
   * @memberof TenrxApiEngine
   */
  public async authGet(
    url: string,
    params: Record<string, string> = {},
    headers: object = {},
  ): Promise<TenrxApiResult> {
    this.ensureValidAccessToken();
    // Needed for the API since the API requires Authorization: {token}
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const authHeaders = { ...headers, Authorization: `${this.accesstoken}` };
    TenrxLibraryLogger.debug('Preparing to execute authenticated GET WebCall.');
    return await this.get(url, params, authHeaders);
  }

  /**
   * Performs a GET request to the specified url
   *
   * @param {string} url - The url to perform the GET request to
   * @param {Record<string, string>} [params={}] - The parameters to pass to the GET request
   * * @param {object} [headers={}] - The headers to pass to the GET request
   * @return {*}  {Promise<TenrxApiResult>} - The result of the GET request
   * @memberof TenrxApiEngine
   */
  public async get(url: string, params: Record<string, string> = {}, headers: object = {}): Promise<TenrxApiResult> {
    TenrxLibraryLogger.debug('Executing GET WebCall: ', { url, params, headers });
    const returnvalue: TenrxApiResult = {
      status: 0,
      content: null,
      error: null,
    };
    try {
      const response = await this.axios({
        url,
        method: 'GET',
        headers: {
          ...headers,
        },
        params,
      });
      TenrxLibraryLogger.silly('GET WebCall Response: ', response);
      returnvalue.status = response.status;
      returnvalue.content = response.data;
    } catch (error) {
      const err = error as AxiosError;
      returnvalue.error = err.message;
      if (err.response) {
        returnvalue.status = err.response.status;
        returnvalue.content = err.response.data;
      }
      TenrxLibraryLogger.silly('GET WebCall Error: ', error);
    }
    return returnvalue;
  }

  /**
   * Performs an authenticated POST request to the specified url.
   *
   * @param {string} url - The url to perform the POST request to.
   * @param {object} body - The body to pass to the POST request.
   * @param {object} [headers={}] - The headers to pass to the POST request.
   * @param {Record<string, string>} [queryparams={}] - The query parameters to pass to the POST request
   * @param {number | undefined} [timeout=undefined] - How long until the request times out
   * @return {*}  {Promise<TenrxApiResult>} - The result of the POST request.
   * @memberof TenrxApiEngine
   */
  public async authPost(
    url: string,
    body: object,
    headers: object = {},
    queryparams: Record<string, string> = {},
    timeout: number | undefined = undefined,
  ): Promise<TenrxApiResult> {
    this.ensureValidAccessToken();
    // Needed for the API since the API requires Authorization: {token}
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const authHeaders = { ...headers, Authorization: `${this.accesstoken}` };
    TenrxLibraryLogger.debug('Preparing to execute authenticated POST WebCall: ');
    return await this.post(url, body, authHeaders, queryparams, timeout);
  }

  /**
   * Performs a POST request to the specified url
   *
   * @param {string} url - The url to perform the POST request to
   * @param {object} [body={}] - The body to pass to the POST request
   * @param {object} [headers={}] - The headers to pass to the POST request
   * @param {Record<string, string>} [queryparams={}] - The query parameters to pass to the POST request
   * @param {number | undefined} [timeout=undefined] - How long until the request times out
   * @return {*}  {Promise<TenrxApiResult>} - The result of the POST request
   * @memberof TenrxApiEngine
   */
  public async post(
    url: string,
    body: object = {},
    headers: object = {},
    queryparams: Record<string, string> = {},
    timeout: number | undefined = undefined,
  ): Promise<TenrxApiResult> {
    TenrxLibraryLogger.debug('Executing POST WebCall: ', { url, body, headers, queryparams });
    const returnvalue: TenrxApiResult = {
      status: 0,
      content: null,
      error: null,
    };
    try {
      const response = await this.axios({
        url,
        method: 'POST',
        headers: {
          ...headers,
        },
        params: queryparams,
        data: body,
        timeout,
      });
      TenrxLibraryLogger.silly('POST WebCall Response: ', response);
      returnvalue.status = response.status;
      returnvalue.content = response.data;
    } catch (error) {
      const err = error as AxiosError;
      returnvalue.error = err.message;
      if (err.response) {
        returnvalue.status = err.response.status;
        returnvalue.content = err.response.data;
      }
      TenrxLibraryLogger.silly('POST WebCall Error: ', error);
    }
    return returnvalue;
  }

  /**
   * Performs an authenticated PUT request to the specified url.
   *
   * @param {string} url - The url to perform the PUT request to.
   * @param {object} params - The parameters to pass to the PUT request.
   * @param {object} [headers={}] - The headers to pass to the PUT request.
   * @return {*}  {Promise<TenrxApiResult>} - The result of the PUT request.
   * @memberof TenrxApiEngine
   */
  public async authPut(url: string, params: object, headers: object = {}): Promise<TenrxApiResult> {
    this.ensureValidAccessToken();
    // Needed for the API since the API requires Authorization: {token}
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const authHeaders = { ...headers, Authorization: `${this.accesstoken}` };
    TenrxLibraryLogger.debug('Preparing to execute authenticated PUT WebCall: ');
    return await this.put(url, params, authHeaders);
  }

  /**
   * Performs an PUT request to the specified url.
   *
   * @param {string} url - The url to perform the PUT request to.
   * @param {object} [params={}] - The parameters to pass to the PUT request.
   * @param {object} [headers={}] - The headers to pass to the PUT request.
   * @return {*}  {Promise<TenrxApiResult>} - The result of the PUT request.
   * @memberof TenrxApiEngine
   */
  public async put(url: string, params: object = {}, headers: object = {}): Promise<TenrxApiResult> {
    TenrxLibraryLogger.debug('Executing PUT WebCall: ', { url, params, headers });
    const returnvalue: TenrxApiResult = {
      status: 0,
      content: null,
      error: null,
    };
    try {
      const response = await this.axios({
        url,
        method: 'PUT',
        headers: {
          ...headers,
        },
        data: params,
      });
      TenrxLibraryLogger.silly('PUT WebCall Response: ', response);
      returnvalue.status = response.status;
      returnvalue.content = response.data;
    } catch (error) {
      const err = error as AxiosError;
      returnvalue.error = err.message;
      if (err.response) {
        returnvalue.status = err.response.status;
        returnvalue.content = err.response.data;
      }
      TenrxLibraryLogger.silly('PUT WebCall Error: ', error);
    }
    return returnvalue;
  }

  /**
   * Performs an authenticated PATCH request to the specified url.
   *
   * @param {string} url - The url to perform the PATCH request to.
   * @param {Record<string, string>} [queryparams={}] - The query parameters to pass to the PATCH request.
   * @param {object} [bodyparams={}] - The body parameters to pass to the PATCH request.
   * @param {object} [headers={}] - The headers to pass to the PATCH request.
   * @return {*}  {Promise<TenrxApiResult>} - The result of the PATCH request.
   * @memberof TenrxApiEngine
   */
  public async authPatch(
    url: string,
    queryparams: Record<string, string> = {},
    bodyparams: object = {},
    headers: object = {},
  ): Promise<TenrxApiResult> {
    this.ensureValidAccessToken();

    // Needed for the API since the API requires Authorization: {token}
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const authHeaders = { ...headers, Authorization: `${this.accesstoken}` };
    TenrxLibraryLogger.debug('Preparing to execute authenticated PATCH WebCall: ');
    return await this.patch(url, queryparams, bodyparams, authHeaders);
  }

  /**
   * Performs an PATCH request to the specified url.
   *
   * @param {string} url - The url to perform the PATCH request to.
   * @param {Record<string, string>} [queryparams={}] - The query parameters to pass to the PATCH request.
   * @param {object} [bodyparams={}] - The body parameters to pass to the PATCH request.
   * @param {object} [headers={}] - The headers to pass to the PATCH request.
   * @return {*}  {Promise<TenrxApiResult>} - The result of the PATCH request.
   * @memberof TenrxApiEngine
   */
  public async patch(
    url: string,
    queryparams: Record<string, string> = {},
    bodyparams: object = {},
    headers: object = {},
  ): Promise<TenrxApiResult> {
    TenrxLibraryLogger.debug('Executing PATCH WebCall: ', { url, queryparams, bodyparams, headers });
    const returnvalue: TenrxApiResult = {
      status: 0,
      content: null,
      error: null,
    };
    try {
      const response = await this.axios({
        url,
        method: 'PATCH',
        headers: {
          ...headers,
        },
        params: queryparams,
        data: bodyparams,
      });
      TenrxLibraryLogger.silly('PATCH WebCall Response: ', response);
      returnvalue.status = response.status;
      returnvalue.content = response.data;
    } catch (error) {
      const err = error as AxiosError;
      returnvalue.error = err.message;
      if (err.response) {
        returnvalue.status = err.response.status;
        returnvalue.content = err.response.data;
      }
      TenrxLibraryLogger.silly('PATCH WebCall Error: ', error);
    }
    return returnvalue;
  }

  /**
   * Gets the TenrxApiEngine instance
   *
   * @readonly
   * @static
   * @type {(TenrxApiEngine)}
   * @memberof TenrxApiEngine
   * @returns {TenrxApiEngine} - The TenrxApiEngine instance
   * @throws {TenrxNotInitialized} - If the TenrxApiEngine instance is not initialized.
   */
  public static get instance(): TenrxApiEngine {
    // This is needed since the actual instance is stored in the _instance static variable
    // eslint-disable-next-line no-underscore-dangle
    if (TenrxApiEngine._instance === null) {
      TenrxLibraryLogger.error('TenrxApiEngine is not initialized. Call TenrxApiEngine.Initialize() first.');
      throw new TenrxNotInitialized(
        'TenrxApiEngine is not initialized. Call TenrxApiEngine.Initialize() first.',
        'TenrxApiEngine',
      );
    }
    // eslint-disable-next-line no-underscore-dangle
    return TenrxApiEngine._instance;
  }

  /**
   * Initializes the TenrxApiEngine singleton instance
   *
   * @static
   * @param {string} businesstoken - The business token to use for the API engine
   * @param {string} baseapi - The base api url to use for the API engine
   * @param {string} [accessToken] - The access token to use for the API engine
   * @param {number} [expireDateStart] - The expire date start of the token to use for the API engine
   * @param {number} [expiresIn] - The expires in date time in seconds of the token.
   * @return {*}  {void}
   * @memberof TenrxApiEngine
   */
  public static initialize(
    businesstoken: string,
    baseapi: string,
    accessToken?: string,
    expireDateStart?: number,
    expiresIn?: number,
  ): void {
    // eslint-disable-next-line no-underscore-dangle
    if (TenrxApiEngine._instance !== null) {
      TenrxLibraryLogger.warn('TenrxApiEngine is already initialized. Call TenrxApiEngine.Initialize() only once.');
      return;
    }
    // eslint-disable-next-line no-underscore-dangle
    TenrxApiEngine._instance = new TenrxApiEngine(businesstoken, baseapi);
    // eslint-disable-next-line no-underscore-dangle
    TenrxApiEngine._instance.accesstoken = accessToken ? accessToken : '';
    // eslint-disable-next-line no-underscore-dangle
    TenrxApiEngine._instance.expireDateStart = expireDateStart ? expireDateStart : 0;
    // eslint-disable-next-line no-underscore-dangle
    TenrxApiEngine._instance.expiresIn = expiresIn ? expiresIn : 0;
  }

  /**
   * Returns the status of initialization of the TenrxApiEngine singleton instance
   *
   * @static
   * @return {*}  {boolean} - True if the TenrxApiEngine is initialized
   * @memberof TenrxApiEngine
   */
  public static isInstanceInitialized(): boolean {
    // eslint-disable-next-line no-underscore-dangle
    return TenrxApiEngine._instance !== null;
  }
}
