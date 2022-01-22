import TenrxApiEngine from './TenrxApiEngine.js';
import { TenrxLibraryLogger } from '../includes/TenrxLogging.js';
import { useTenrxApi } from '../includes/TenrxFunctions.js';
import TenrxVisitTypeAPIModel from '../apiModel/TenrxVisitTypeAPIModel.js';

/**
 * Represents a Tenrx visit type.
 *
 * @export
 * @class TenrxVisitType
 */
export default class TenrxVisitType {
  /**
   * The id of the visit type.
   *
   * @type {number}
   * @memberof TenrxVisitType
   */

  /**
   * The id of the visit type.
   *
   * @type {number}
   * @memberof TenrxVisitType
   */
  id: number;

  /**
   * The name of the visit type.
   *
   * @type {string}
   * @memberof TenrxVisitType
   */
  visitType: string;

  /**
   * The display order of the visit type.
   *
   * @type {number}
   * @memberof TenrxVisitType
   */
  displayOrder: number;

  /**
   * The id of the parent visit type.
   *
   * @type {number}
   * @memberof TenrxVisitType
   */
  parentVisitTypeId: number;

  /**
   * The level of the visit type.
   *
   * @type {number}
   * @memberof TenrxVisitType
   */
  level: number;

  /**
   * The photo path of the visit type.
   *
   * @type {string}
   * @memberof TenrxVisitType
   */
  photoPath: string;

  /**
   * The list of sub visit types.
   *
   * @type {TenrxVisitType[]}
   * @memberof TenrxVisitType
   */
  visitTypeListings: TenrxVisitType[];

  /**
   * Creates an instance of TenrxVisitType.
   *
   * @param {TenrxVisitTypeAPIModel} data
   * @param {string} [language='en']
   * @memberof TenrxVisitType
   */
  constructor(data: TenrxVisitTypeAPIModel, language = 'en') {
    this.id = data.id;
    this.visitType = language === 'en' ? data.visitType : language === 'es' ? data.visitTypeEs : data.visitType;
    this.displayOrder = data.displayOrder;
    this.parentVisitTypeId = data.parentVisitTypeId;
    this.level = data.level;
    this.photoPath = data.photoPath;
    this.visitTypeListings = [];
    if (data.visitTypeListings) {
      for (const visitTypeListing of data.visitTypeListings) {
        this.visitTypeListings.push(new TenrxVisitType(visitTypeListing, language));
      }
    }
  }

  /**
   * Gets all the visit types
   *
   * @static
   * @param {string} [language='en'] - The language to be used when creating the instance.
   * @param {TenrxApiEngine} [apiEngine=useTenrxApi()] - The api engine to be used when creating the instance.
   * @return {*}  {(Promise<TenrxVisitType[] | null>)}
   * @memberof TenrxVisitType
   */
  public static async getVisitTypes(
    language = 'en',
    apiEngine: TenrxApiEngine = useTenrxApi(),
  ): Promise<TenrxVisitType[] | null> {
    TenrxLibraryLogger.silly('TenrxVisitType.GetVisitTypes() Started');
    if (apiEngine) {
      const result: TenrxVisitType[] = [];
      TenrxLibraryLogger.info('Retrieving visit types.');
      const response = await apiEngine.getVisitTypes();
      if (response.status === 200) {
        TenrxLibraryLogger.debug('Response from API: ', response.content);
        if (response.content) {
          const content = response.content as { data: TenrxVisitTypeAPIModel[] };
          if (content.data) {
            TenrxLibraryLogger.info('Total Visit Types received: ', content.data.length);
            for (const visitType of content.data) {
              result.push(new TenrxVisitType(visitType, language));
            }
            return result;
          } else {
            TenrxLibraryLogger.error(
              'API returned data as null when getting visit types. Content of error is: ',
              response.error,
            );
            return null;
          }
        } else {
          TenrxLibraryLogger.error(
            'API returned content as null when getting visit types. Content of error is: ',
            response.error,
          );
          return null;
        }
      } else {
        TenrxLibraryLogger.error('API returned error: ', response.error);
        return null;
      }
    } else {
      TenrxLibraryLogger.fatal('TenrxApiEngine is not initialized.');
      return null;
    }
  }
}
