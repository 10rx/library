import TenrxCreditCardAPIModel from '../apiModel/TenrxCreditCardAPIModel.js';
import { TenrxEnumCountry } from '../includes/TenrxEnums.js';
import { useTenrxApi } from '../includes/TenrxFunctions.js';
import { TenrxStateNameToStateId } from '../includes/TenrxStates.js';
import { TenrxLibraryLogger, TenrxCardBrands } from '../index.js';
import TenrxCreditCard from '../types/TenrxCreditCard.js';
import TenrxApiEngine from './TenrxApiEngine.js';

export default class TenrxWallet {
  private internalCards: TenrxCreditCard[];

  constructor(data: TenrxCreditCardAPIModel[]) {
    this.internalCards = [];
    for (const card of data) {
      this.internalCards.push({
        paymentID: card.paymentID,
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
  public get cards(): TenrxCreditCard[] {
    return this.internalCards;
  }

  public static async getWallet(apiEngine: TenrxApiEngine = useTenrxApi()): Promise<TenrxWallet | null> {
    try {
      const response = await apiEngine.getCards();
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

  /**
   * Check if a card number is correct
   *
   * @static
   * @param {string} card
   * @return {*}
   * @memberof TenrxWallet
   */
  public static isValidCard(card: string) {
    const nDigits = card.length;
    let sum = 0;
    const parity = (nDigits - 2) % 2;
    for (let i = 0; i < nDigits; i++) {
      let digit = Number(card[i]);
      if (i % 2 === parity) digit *= 2;
      if (digit > 9) digit -= 9;
      sum += digit;
    }
    return sum % 10 === 0;
  }

  /**
   * Get the brand from card number
   *
   * @static
   * @param {string} card
   * @return {*}
   * @memberof TenrxWallet
   */
  public static getCardBrand(card: string) {
    const jcbRegex = /^(?:2131|1800|35)[0-9]{0,}$/;
    const amexRegex = /^3[47][0-9]{0,}$/;
    const dinersRegex = /^3(?:0[0-59]{1}|[689])[0-9]{0,}$/;
    const visaRegex = /^4[0-9]{0,}$/;
    const mastercardRegex = /^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)[0-9]{0,}$/;
    const maestroRegex = /^(5[06789]|6)[0-9]{0,}$/;
    const discoverRegex = /^(6011|65|64[4-9]|62212[6-9]|6221[3-9]|622[2-8]|6229[01]|62292[0-5])[0-9]{0,}$/;

    if (card.match(jcbRegex)) {
      return TenrxCardBrands.jcb;
    } else if (card.match(amexRegex)) {
      return TenrxCardBrands.amex;
    } else if (card.match(dinersRegex)) {
      return TenrxCardBrands.diners;
    } else if (card.match(visaRegex)) {
      return TenrxCardBrands.visa;
    } else if (card.match(mastercardRegex)) {
      return TenrxCardBrands.mastercard;
    } else if (card.match(discoverRegex)) {
      return TenrxCardBrands.discover;
    } else if (card.match(maestroRegex)) {
      if (card[0] === '5') {
        return TenrxCardBrands.mastercard;
      } else {
        return TenrxCardBrands.maestro;
      }
    }

    return TenrxCardBrands.other;
  }
}
