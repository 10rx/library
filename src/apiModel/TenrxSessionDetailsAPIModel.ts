/* eslint-disable @typescript-eslint/naming-convention */
export default interface TenrxSessionDetailsAPIModel {
  apiStatus: {
    message: string;
    statusCode: number;
    appError: string;
  };
  data: {
    ChatUrl: string;
    ChatSession: {
      SessionKey: string;
      SessionID: number;
    };
  };
}
