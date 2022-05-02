export default interface TenrxGetProductTaxAPIModel {
  productsForTaxCalculaitons: {
    productId: number;
    price: number;
  }[];
  shippingAddress: {
    apartmentNumber?: string;
    address1: string;
    address2?: string;
    city: string;
    stateName: string;
    zipCode: string;
    country: string;
  };
}
