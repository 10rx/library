import TenrxLoginSecurityQuestionAnswer from "../types/TenrxLoginSecurityQuestionAnswer";
export default interface TenrxSaveUserSecurityQuestionAPIModel {
    userName: string;
    password: string;
    macAddress: string;
    securityQuestionList: TenrxLoginSecurityQuestionAnswer[];
}