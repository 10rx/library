export default interface TenrxOrderDetailsModel {
  address: Address;
  products: Product[];
  last4: string;
  datePlaced: string;
  status: number;
  shippingType: number;
  subtotal: number;
  tax: number;
  discount: number;
  shippingCost: number;
  total: number;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  doctorName: string | null;
  doctorEmail: string | null;
}

interface Product {
  name: string;
  quantity: number;
  price: number;
  total: number;
  status: number;
}

interface Address {
  address1: string;
  address2: string;
  city: string;
  zip: string;
}
