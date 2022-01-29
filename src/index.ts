// Logs
export { TenrxLibraryLogger } from './includes/TenrxLogging.js';

// Classes
export { default as TenrxApiEngine } from './classes/TenrxApiEngine.js';
export { default as TenrxVisitType } from './classes/TenrxVisitType.js';
export { default as TenrxProductCategory } from './classes/TenrxProductCategory.js';
export { default as TenrxGenderCategory } from './classes/TenrxGenderCategory.js';
export { default as TenrxProduct } from './classes/TenrxProduct.js';
export { default as TenrxLogger } from './classes/TenrxLogger.js';

// Types
export { default as TenrxApiResult } from './types/TenrxApiResult.js';
export { default as TenrxLoginResponseData } from './types/TenrxLoginResponseData.js';
export { default as TenrxLoginSecurityQuestion } from './types/TenrxLoginSecurityQuestion.js';
export { default as TenrxLoginSecurityQuestionAnswer } from './types/TenrxLoginSecurityQuestionAnswer.js';
export { default as TenrxRegistrationFormData } from './types/TenrxRegistrationFormData.js';

// Exceptions
export { default as TenrxServerError } from './exceptions/TenrxServerError.js';
export { default as TenrxNotInitialized } from './exceptions/TenrxNotInitialized.js';
export { default as TenrxAccessTokenExpired } from './exceptions/TenrxAccessTokenExpired.js';
export { default as TenrxAccessTokenInvalid } from './exceptions/TenrxAccessTokenInvalid.js';
export { default as TenrxNotLoaded } from './exceptions/TenrxNotLoaded.js';
export { default as TenrxLoadError } from './exceptions/TenrxLoadError.js';

// The following is needed to get rid of warnings when creating documentation. The following are documented in swagger.
// TODO: add links to swagger.
export { default as TenrxVisitTypeAPIModel } from './apiModel/TenrxVisitTypeAPIModel.js';
export { default as TenrxProductCategoryAPIModel } from './apiModel/TenrxProductCategoryAPIModel.js';
export { default as TenrxSaveUserSecurityQuestionAPIModel } from './apiModel/TenrxSaveUserSecurityQuestionAPIModel.js';
export { default as TenrxRegisterUserParameterAPIModel } from './apiModel/TenrxRegisterUserParameterAPIModel.js';

// Enums
export { TenrxEnumGender, TenrxEnumCountry, TenrxEnumState } from './includes/TenrxEnums.js';

// Functions
export {
  initializeTenrx,
  useTenrxApi,
  useTenrxLogger,
  authenticateTenrx,
  checkIfEmailExists,
  logoutTenrx,
  saveSecurityQuestionAnswers,
  registerUser,
} from './includes/TenrxFunctions.js';
