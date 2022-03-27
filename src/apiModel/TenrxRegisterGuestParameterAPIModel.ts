export default interface TenrxRegisterGuestParameterAPIModel {
  id: number;
  firstName: string;
  lastName: string;
  emailId: string;
  phoneNo: string;
  address: string;
  city: string;
  stateID: number;
  zip: string;
  organizationID: number;
  isActive: boolean;
  isDeleted: boolean;
  visitTypeId: number;
  userType: number;
}
