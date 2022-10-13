export default interface TenrxAPIGetCartTotalRequest {
  orderShippingAddress: OrderShippingAddress;
  couponCode: string | null;
  shippingPrice: number;
  productsInCart: ProductsInCart[];
}

interface ProductsInCart {
  productId: number;
  quantity: number;
}

interface OrderShippingAddress {
  city: string;
  state: string;
  zipCode: string;
}
