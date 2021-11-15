import { TenrxApiEngine } from './classes/TenrxApiEngine';

export { TenrxApiEngine } from "./classes/TenrxApiEngine";
export { TenrxApiResult } from "./classes/TenrxApiResult";
export { TenrxVisitType } from "./classes/TenrxVisitType";
export { TenrxLogger } from "./includes/TenrxLogger";

export const InitializeTenrx = (businesstoken: string, baseapi: string): void => {
    TenrxApiEngine.Initialize(businesstoken, baseapi);
}

export const useTenrx = (): TenrxApiEngine | null => {
    return TenrxApiEngine.Instance;
}