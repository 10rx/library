import fetch from 'node-fetch';
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

/**
 * Represents a Tenrx API engine.
 *
 * @export
 * @class TenrxApiEngine - A class that represents a Tenrx API engine.
 */
export default class TenrxApiEngine {
  private businesstoken: string;
  private baseapi: string;
  private accesstoken: string;
  private expiresIn: number;
  private expireDateStart: number;

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
    this.businesstoken = businesstoken;
    this.baseapi = baseapi;
    this.accesstoken = '';
    this.expiresIn = -1;
    this.expireDateStart = 0;
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
   * Saves questionnaire answers to the backend server.
   *
   * @param {number} patientId - The patient id to save the answers for
   * @param {number} userId - The user id to save the answers for
   * @param {{ visitTypeId: number }[]} visitTypeId - The visit type to save the answers for
   * @param {number} paymentId - The payment id to save the answers for
   * @param {TenrxQuestionnaireSurveyResponseAPIModel[]} surveyResponses - The answers to save
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async saveAnswers(
    patientId: number,
    userId: number,
    visitTypeId: { visitTypeId: number }[],
    paymentId: number,
    surveyResponses: TenrxQuestionnaireSurveyResponseAPIModel[],
  ): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Saving answers to API');
    const answers: TenrxQuestionnaireSaveAnswersAPIModel = {
      surveyResponses,
      paymentId,
      appointmentId: 0,
      visitTypeId,
      guestMasterId: 0,
      surgeryMasterId: 0,
      patientId,
      userId,
      patientComment: '',
      paymentStatus: true,
      patientEncounterId: 0,
      isClientAccepted: true,
      isSurgeryRequest: false,
    };
    try {
      const response = await this.authPost(`${this.baseapi}/Questionnaire/SaveAnswers`, answers);
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
      const response = await this.post(`${this.baseapi}/Login/GetQuestionList`, {
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
      const response = await this.authGet(`${this.baseapi}/api/v1/Payment/GetPaymentCardByUser`);
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
      const response = await this.authPost(`${this.baseapi}/Patients/GuestAddProduct`, order);
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
      const response = await this.post(`${this.baseapi}/Login/GuestAddProduct`, order);
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
      const response = await this.authPost(`${this.baseapi}/api/v1/Patient/SaveProduct`, order);
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
   * Places an order to the current user account unauthenticated.
   *
   * @param {TenrxSaveProductAPIModel} order - The order to place
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async saveProduct(order: TenrxSaveProductAPIModel): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Saving product to API');
    try {
      const response = await this.post(`${this.baseapi}/api/v1/Login/SaveProduct`, order);
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
   * Pays for a charge with authentication.
   *
   * @param {TenrxChargeAPIModel} charge - The charge to pay for
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async authSavePaymentDetails(charge: TenrxChargeAPIModel): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Saving payment details to API (auth)');
    try {
      const response = await this.authPost(`${this.baseapi}/api/v1/Payment/SavePaymentDetails`, charge);
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
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async savePaymentDetails(charge: TenrxChargeAPIModel): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Saving payment details to API');
    try {
      const response = await this.post(`${this.baseapi}/api/v1/Login/SavePaymentDetails`, charge);
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
   * Registers a new user to Tenrx
   *
   * @param {TenrxRegisterUserParameterAPIModel} registrationData - Contains the registration information
   * @return {*}  {Promise<TenrxApiResult>} - The result of the API call
   * @memberof TenrxApiEngine
   */
  public async registerUser(registrationData: TenrxRegisterUserParameterAPIModel): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Registering user with backend servers');
    try {
      const response = await this.post(`${this.baseapi}/Login/RegisterPatient`, registrationData);
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
      const response = await this.authPost(`${this.baseapi}/Patients/UpdatePatientDetails`, details);
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
      const response = await this.post(`${this.baseapi}/Login/SaveUserSecurityQuestion`, securityQuestionAnswers);
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
      const response = await this.post(`${this.baseapi}/Login/CheckIsEmailExist`, {}, {}, { email });
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
      const response = await this.authPatch(`${this.baseapi}/Login/Logout`);
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
   * Refreshes the current access token in the engine.
   *
   * @return {*}  {Promise<TenrxApiResult>}
   * @memberof TenrxApiEngine
   */
  public async refreshToken(): Promise<TenrxApiResult> {
    TenrxLibraryLogger.silly('Refreshing access token');
    try {
      const response = await this.authGet(`${this.baseapi}/api/v1/Common/RefreshToekn`);
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

  private processLoginResponse(response: TenrxApiResult, callerForLogPurposes: string): void {
    if (response && response.status === 200) {
      TenrxLibraryLogger.silly(`${callerForLogPurposes} Response: `, response.content);
      if (response.content) {
        const content = response.content as TenrxLoginAPIModel;
        if (content.data) {
          if (content.access_token) {
            this.setAccessToken(content.access_token, content.expires_in, Date.now());
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
      const response: TenrxApiResult = await this.post(`${this.baseapi}/Login/PatientLogin`, {
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
      const response = await this.get(`${this.baseapi}/Login/GetVisitTypes`);
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
      const response = await this.get(`${this.baseapi}/Login/GetProductCategory`, {
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
      const response = await this.get(`${this.baseapi}/Login/GetGenderCategory`, {
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
      const response = await this.post(`${this.baseapi}/Login/getTreatmentProductList`, {
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
      const response = await this.get(`${this.baseapi}/Login/GetMedicationProductDetails`, {
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
    const internalurl: URL = new URL(url);
    const returnvalue: TenrxApiResult = {
      status: 0,
      content: null,
      error: null,
    };
    if (params) {
      Object.keys(params).forEach((key) => {
        internalurl.searchParams.append(key, params[key]);
      });
    }
    TenrxLibraryLogger.silly('Real GET URL: ', internalurl.toString());
    try {
      const response = await fetch(internalurl.toString(), {
        method: 'GET',
        headers: {
          businessToken: this.businesstoken,
          ...headers,
        },
      });
      TenrxLibraryLogger.silly('GET WebCall Response: ', response);
      returnvalue.status = response.status;
      // Need to find a better way to write this so that we don't have to disable the rule.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      returnvalue.content = await response.json();
    } catch (error) {
      returnvalue.error = error;
      TenrxLibraryLogger.silly('GET WebCall Error: ', error);
    }
    return returnvalue;
  }

  /**
   * Performs an authenticated POST request to the specified url.
   *
   * @param {string} url - The url to perform the POST request to.
   * @param {object} params - The parameters to pass to the POST request.
   * @param {object} [headers={}] - The headers to pass to the POST request.
   * @return {*}  {Promise<TenrxApiResult>} - The result of the POST request.
   * @memberof TenrxApiEngine
   */
  public async authPost(
    url: string,
    params: object,
    headers: object = {},
    queryparams: Record<string, string> = {},
  ): Promise<TenrxApiResult> {
    this.ensureValidAccessToken();
    // Needed for the API since the API requires Authorization: {token}
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const authHeaders = { ...headers, Authorization: `${this.accesstoken}` };
    TenrxLibraryLogger.debug('Preparing to execute authenticated POST WebCall: ');
    return await this.post(url, params, authHeaders, queryparams);
  }

  /**
   * Performs a POST request to the specified url
   *
   * @param {string} url - The url to perform the POST request to
   * @param {object} [params={}] - The parameters to pass to the POST request
   * @param {object} [headers={}] - The headers to pass to the POST request
   * @return {*}  {Promise<TenrxApiResult>} - The result of the POST request
   * @memberof TenrxApiEngine
   */
  public async post(
    url: string,
    params: object = {},
    headers: object = {},
    queryparams: Record<string, string> = {},
  ): Promise<TenrxApiResult> {
    TenrxLibraryLogger.debug('Executing POST WebCall: ', { url, params, headers, queryparams });
    const returnvalue: TenrxApiResult = {
      status: 0,
      content: null,
      error: null,
    };
    const internalurl: URL = new URL(url);
    if (queryparams) {
      Object.keys(queryparams).forEach((key) => {
        internalurl.searchParams.append(key, queryparams[key]);
      });
    }
    TenrxLibraryLogger.silly('Real POST URL: ', internalurl.toString());
    try {
      const response = await fetch(internalurl, {
        method: 'POST',
        headers: {
          businessToken: this.businesstoken,
          // This is a standard HTTP header.
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(params), // body data type must match "Content-Type" header. So we need to fix this in the future to support other data types.
      });
      TenrxLibraryLogger.silly('POST WebCall Response: ', response);
      returnvalue.status = response.status;
      // Need to find a better way to write this so that we don't have to disable the rule.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      returnvalue.content = await response.json();
    } catch (error) {
      returnvalue.error = error;
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
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          businessToken: this.businesstoken,
          // This is a standard HTTP header.
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(params), // body data type must match "Content-Type" header. So we need to fix this in the future to support other data types.
      });
      TenrxLibraryLogger.silly('PUT WebCall Response: ', response);
      returnvalue.status = response.status;
      // Need to find a better way to write this so that we don't have to disable the rule.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      returnvalue.content = await response.json();
    } catch (error) {
      returnvalue.error = error;
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
    const internalurl: URL = new URL(url);
    if (queryparams) {
      Object.keys(queryparams).forEach((key) => {
        internalurl.searchParams.append(key, queryparams[key]);
      });
    }
    TenrxLibraryLogger.silly('Real PATCH URL: ', internalurl.toString());
    try {
      const response = await fetch(internalurl.toString(), {
        method: 'PATCH',
        headers: {
          businessToken: this.businesstoken,
          // This is a standard HTTP header.
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(bodyparams), // body data type must match "Content-Type" header. So we need to fix this in the future to support other data types.
      });
      TenrxLibraryLogger.silly('PATCH WebCall Response: ', response);
      returnvalue.status = response.status;
      // Need to find a better way to write this so that we don't have to disable the rule.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      returnvalue.content = await response.json();
    } catch (error) {
      returnvalue.error = error;
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
