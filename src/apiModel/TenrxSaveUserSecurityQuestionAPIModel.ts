import TenrxLoginSecurityQuestionAnswer from "../types/TenrxLoginSecurityQuestionAnswer.js";
export default interface TenrxSaveUserSecurityQuestionAPIModel {
    username: string;
    password: string;
    macaddress: string;
    securityQuestionList: TenrxLoginSecurityQuestionAnswer[];
}