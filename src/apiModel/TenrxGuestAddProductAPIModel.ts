export default interface TenrxGuestAddProductAPIModel {
    guestMasterID: number;
    isActive: boolean;
    isDeleted: boolean;
    userID: number;
    patientId: number;
    statusId: number;
    paymentId: number;
    totalPrice: number;
    medicationProduct: {
        id: number;
        productName: string;
        productDetails: string;
        quantity: number;
        price: number;
        productId: number;
        strength: string;
    }[];
}