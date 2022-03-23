export default interface TenrxGetDoctorAvailabilityForPatientAPIModel {
    doctorName: string;
    appointmentSlots: {
        slotStartTime: string;
        slotEndTime: string;
    }[];
}