import { TenrxLogger } from "../../src";
import { InitializeTenrx, TenrxApiEngine } from '../../src/';

export const BUSINESS_TOKEN = '6dhzpW7t3Upa/mhuU52Iig==';
export const TEST_API_BASE_URL = 'https://10rxapi.csscloudservices.com';

TenrxLogger.setSettings({
    type: 'pretty',
    minLevel: 'warn'
});

(TenrxApiEngine.isInstanceInitialized) ? InitializeTenrx(BUSINESS_TOKEN, TEST_API_BASE_URL) : null;

export const Testlogger = TenrxLogger;