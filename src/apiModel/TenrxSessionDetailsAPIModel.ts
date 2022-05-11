/* eslint-disable @typescript-eslint/naming-convention */
export default interface TenrxSessionDetailsAPIModel {
  apiStatus: {
    message: string;
    statusCode: number;
    appError: string;
  };
  data: {
    chatUrl: string;
    chatSession: {
      sessionKey: string;
      sessionID: string;
    };
  };
}
