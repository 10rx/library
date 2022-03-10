// Logs
export { TenrxLibraryLogger } from './includes/TenrxLogging.js';

// Classes
export { default as TenrxApiEngine } from './classes/TenrxApiEngine.js';
export { default as TenrxVisitType } from './classes/TenrxVisitType.js';
export { default as TenrxProductCategory } from './classes/TenrxProductCategory.js';
export { default as TenrxGenderCategory } from './classes/TenrxGenderCategory.js';
export { default as TenrxProduct } from './classes/TenrxProduct.js';
export { default as TenrxLogger } from './classes/TenrxLogger.js';
export { default as TenrxStorage } from './classes/TenrxStorage.js';
export { default as TenrxCart } from './classes/TenrxCart.js';
export { default as TenrxPatient } from './classes/TenrxPatient.js';
export { default as TenrxUserAccount } from './classes/TenrxUserAccount.js';
export { default as TenrxWallet } from './classes/TenrxWallet.js';
export { default as TenrxChatInterface } from './classes/TenrxChatInterface.js';
export { default as TenrxChatEngine } from './classes/TenrxChatEngine.js';

// Types
export { default as TenrxApiResult } from './types/TenrxApiResult.js';
export { default as TenrxLoginResponseData } from './types/TenrxLoginResponseData.js';
export { default as TenrxLoginSecurityQuestion } from './types/TenrxLoginSecurityQuestion.js';
export { default as TenrxLoginSecurityQuestionAnswer } from './types/TenrxLoginSecurityQuestionAnswer.js';
export { default as TenrxRegistrationFormData } from './types/TenrxRegistrationFormData.js';
export { default as TenrxMedicationStrength } from './types/TenrxMedicationStrength.js';
export { TenrxStorageScope } from './classes/TenrxStorage.js';
export { default as TenrxCartEntry } from './types/TenrxCartEntry.js';
export { default as TenrxStripeCreditCard } from './types/TenrxStripeCreditCard.js';
export { default as TenrxPaymentResult } from './types/TenrxPaymentResult.js';
export { default as TenrxStreetAddress } from './types/TenrxStreetAddress.js';
export { default as TenrxOrderPlacementResult } from './types/TenrxOrderPlacementResult.js';
export { default as TenrxCartCheckoutResult } from './types/TenrxCartCheckoutResult.js';
export {
  default as TenrxChatEvent,
  TenrxChatEventPayload,
  TenrxChatParticipantJoinedPayload,
  TenrxChatMessagePayload,
  TenrxChatStartedPayload,
} from './types/TenrxChatEvent.js';

// Exceptions
export { default as TenrxServerError } from './exceptions/TenrxServerError.js';
export { default as TenrxNotInitialized } from './exceptions/TenrxNotInitialized.js';
export { default as TenrxAccessTokenExpired } from './exceptions/TenrxAccessTokenExpired.js';
export { default as TenrxAccessTokenInvalid } from './exceptions/TenrxAccessTokenInvalid.js';
export { default as TenrxNotLoaded } from './exceptions/TenrxNotLoaded.js';
export { default as TenrxLoadError } from './exceptions/TenrxLoadError.js';
export { default as TenrxChatNotActive } from './exceptions/TenrxChatNotActive.js';

// The following is needed to get rid of warnings when creating documentation. The following are documented in swagger.
// TODO: add links to swagger.
export { default as TenrxVisitTypeAPIModel } from './apiModel/TenrxVisitTypeAPIModel.js';
export { default as TenrxProductCategoryAPIModel } from './apiModel/TenrxProductCategoryAPIModel.js';
export { default as TenrxSaveUserSecurityQuestionAPIModel } from './apiModel/TenrxSaveUserSecurityQuestionAPIModel.js';
export { default as TenrxRegisterUserParameterAPIModel } from './apiModel/TenrxRegisterUserParameterAPIModel.js';
export {
  default as TenrxLoginAPIModel,
  TenrxLoginAPIModelData,
  TenrxLoginAPIModelPatientData,
} from './apiModel/TenrxLoginAPIModel.js';

// Enums
export {
  TenrxEnumGender,
  TenrxEnumCountry,
  TenrxEnumState,
  TenrxChatEventType,
  TenrxChatStatus,
  TenrxQuestionnaireAnswerType,
} from './includes/TenrxEnums.js';

// Functions
export {
  initializeTenrx,
  useTenrxApi,
  useTenrxLogger,
  useTenrxStorage,
  useTenrxCart,
  useTenrxUserAccount,
  useTenrxPatient,
  authenticateTenrx,
  checkIfEmailExists,
  logoutTenrx,
  saveSecurityQuestionAnswers,
  registerUser,
  tenrxRoundTo,
  isBrowser,
  isNode,
  isWebWorker,
  isJsDom,
} from './includes/TenrxFunctions.js';
