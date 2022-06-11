export default interface TenrxGetAppointmentsForPatientAPIModel {
  startDateTime: string;
  endDateTime: string;
  orderNumber: string;
  defaultDuration: number;
  appointmentStatusCode: number;
  cancelTypeId: number;
  cancelReason: string | null;
  docotorName: string;
}
