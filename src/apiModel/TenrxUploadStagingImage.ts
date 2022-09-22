import { TenrxImageRoles } from '../index.js';

export default interface TenrxUploadStagingImage {
  uri: string;
  role: TenrxImageRoles;
  productID: number;
  visitType: number;
  name: string;
}
