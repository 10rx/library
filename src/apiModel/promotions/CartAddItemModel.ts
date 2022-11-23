import { CartItem, CartTaxDetails } from '../../index.js';

export default interface CartAddItemModel {
  items: CartItem[];
  taxDetails: CartTaxDetails;
}
