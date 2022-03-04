import {
  initializeTenrx,
  TenrxApiEngine,
  TenrxCart,
  TenrxEnumState,
  TenrxLibraryLogger,
  TenrxProduct,
  useTenrxCart,
} from '../../src/index.js';
import TenrxStreetAddress from '../../src/types/TenrxStreetAddress.js';
import TenrxFileStorage from './TenrxFileStorage.js';

export const BUSINESS_TOKEN = '6dhzpW7t3Upa/mhuU52Iig==';
export const TEST_API_BASE_URL = 'https://10rxapi.csscloudservices.com';

export const TEST_USERNAME_EXISTS = 'test@test.com';
export const TEST_USERNAME_NOT_EXISTS = 'nonexistingtest@test.com';

export const TEST_PASSWORD_SUCCESS = 'Password1!';
export const TEST_PASSWORD_FAILED = 'WrongPassword1!';

export const TEST_PASSWORD_HASHED_SUCCESS = '$2a$04$RFP6IOZqWqe.Pl6kZC/xmuv3hLvkRvwEBleya7YQ4iVNllXCxQc8a';
export const TEST_PASSWORD_HASHED_FAILED = '$2a$04$RFP6IOZqWqe.Pl6kZC/xmuv3hLvkRvwEBleya7YQ4iVNllXCxQc8a';

export const TEST_ADDRESS: TenrxStreetAddress = {
  address1: '123 Main St',
  city: 'Fort Lauderdale',
  stateId: TenrxEnumState.Florida,
  zipCode: '33309'
}

TenrxLibraryLogger.setSettings({
  type: 'pretty',
  minLevel: 'warn',
});

if (!TenrxApiEngine.isInstanceInitialized()) initializeTenrx(BUSINESS_TOKEN, TEST_API_BASE_URL, new TenrxFileStorage());

export const Testlogger = TenrxLibraryLogger;

export const MakeRandomString = (length: number): string => {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const getSampleFullCart = (product: TenrxProduct): TenrxCart => {
  const cart = useTenrxCart();
  cart.addItem(product, 1);
  return cart;
};
