export default interface TenrxUpdatePatientInfoAPIModel {
  patientProfile: {
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
    middleName: string;
    dob: string;
    gender: number;
    phoneNumber: string;
  };
  patientAddress: {
    address1: string;
    address2: string;
    city: string;
    countryId: number;
    stateId: number;
    zip: string;
  };
  photoBase64?: string;
}
