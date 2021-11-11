import { TenrxLogger } from "../../src";

export const BUSINESS_TOKEN = '6dhzpW7t3Upa/mhuU52Iig==';
export const TEST_API_BASE_URL = 'https://10rxapi.csscloudservices.com';

TenrxLogger.setSettings({
    type: 'pretty',
    minLevel: 'debug'
})

export const Testlogger = TenrxLogger;