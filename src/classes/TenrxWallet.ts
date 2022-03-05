import TenrxCreditCardAPIModel from '../apiModel/TenrxCreditCardAPIModel.js';
import { TenrxEnumCountry } from '../includes/TenrxEnums.js';
import { useTenrxApi } from '../includes/TenrxFunctions.js';
import { TenrxStateNameToStateId } from '../includes/TenrxStates.js';
import { TenrxLibraryLogger } from '../index.js';
import TenrxStripeCreditCard from '../types/TenrxStripeCreditCard.js';
import TenrxApiEngine from './TenrxApiEngine.js';

export default class TenrxWallet {
  private internalCards: TenrxStripeCreditCard[];

  constructor(data: TenrxCreditCardAPIModel[]) {
    this.internalCards = [];
    for (const card of data) {
      this.internalCards.push({
        cardId: card.cardId,
        paymentMethod: card.paymentMethod,
        nameOnCard: card.name,
        last4: card.last4,
        expMonth: card.exp_month,
        expYear: card.exp_year,
        brand: card.brand,
        address: {
          address1: card.addressLine1,
          address2: card.addressLine2,
          city: card.addressCity,
          stateId: TenrxStateNameToStateId[card.addressState],
          zipCode: card.addressZip,
        },
        country: TenrxEnumCountry[card.addressCountry as keyof typeof TenrxEnumCountry],
      });
    }
  }
  public get cards(): TenrxStripeCreditCard[] {
    return this.internalCards;
  }

  public static async getWallet(apiEngine: TenrxApiEngine = useTenrxApi()): Promise<TenrxWallet | null> {
    try {
      const response = await apiEngine.getPaymentCardByUser();
      if (response) {
        if (response.status === 200) {
          if (response.content) {
            const content = response.content as {
              data: TenrxCreditCardAPIModel[];
              apiStatus: { message: string; statusCode: number };
            };
            if (content.apiStatus.statusCode === 200) {
              if (content.data instanceof Array) {
                return new TenrxWallet(content.data);
              } else {
                TenrxLibraryLogger.error('TenrxWallet.getWallet: response.content.data is not an array');
              }
            } else {
              TenrxLibraryLogger.error(`TenrxWallet.getWallet: ${content.apiStatus.message}`);
            }
          } else {
            TenrxLibraryLogger.error('TenrxWallet.getWallet: response.content is null');
          }
        } else {
          TenrxLibraryLogger.error(`TenrxWallet.getWallet: ${response.status}}`);
        }
      }
    } catch (error) {
      TenrxLibraryLogger.error('Error while attemping to load wallet from API: ', error);
    }
    return null;
  }
}
