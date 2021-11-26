import { TenrxLogger } from "../../src";
import { InitializeTenrx, TenrxApiEngine } from '../../src/';

export const BUSINESS_TOKEN = '6dhzpW7t3Upa/mhuU52Iig==';
export const TEST_API_BASE_URL = 'https://10rxapi.csscloudservices.com';

export const TEST_USERNAME_EXISTS = 'test@test.com';
export const TEST_USERNAME_NOT_EXISTS = 'nonexistingtest@test.com';

export const TEST_PASSWORD_SUCCESS = 'Password1!';
export const TEST_PASSWORD_FAILED = 'WrongPassword1!';

export const TEST_PASSWORD_HASHED_SUCCESS = '$2a$04$RFP6IOZqWqe.Pl6kZC/xmuv3hLvkRvwEBleya7YQ4iVNllXCxQc8a';
export const TEST_PASSWORD_HASHED_FAILED = '$2a$04$RFP6IOZqWqe.Pl6kZC/xmuv3hLvkRvwEBleya7YQ4iVNllXCxQc8a';

TenrxLogger.setSettings({
    type: 'pretty',
    minLevel: 'info'
});

if (!TenrxApiEngine.isInstanceInitialized()) InitializeTenrx(BUSINESS_TOKEN, TEST_API_BASE_URL);

export const Testlogger = TenrxLogger;