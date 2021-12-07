import TenrxLoginSecurityQuestionAnswer from "../types/TenrxLoginSecurityQuestionAnswer";
export default interface TenrxSaveUserSecurityQuestionAPIModel {
    username: string;
    password: string;
    macaddress: string;
    securityQuestionList: TenrxLoginSecurityQuestionAnswer[];
}