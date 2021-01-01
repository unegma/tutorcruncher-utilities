const BaseUtilities = require('./BaseUtilities');

/**
 * Payment Utilities
 */
class PaymentUtilities extends BaseUtilities {
  constructor(tutorCruncherApiKey, errorLogUrl, errorLogPrefix) {
    super(tutorCruncherApiKey, errorLogUrl, errorLogPrefix);
  }

  /**
   * UTILITY FUNCTIONS
   */

  /**
   * Get AdHocCharge by Id
   *
   * @param id
   * @returns {Promise<*[]>}
   */
  getAdHocCharge = async function (id) {
    console.log(`${this._errorLogPrefix}Beginning getAdHocCharge`);
    let charge = await this.getFromTC(`/adhoccharges/${id}`)
    console.log(`${this._errorLogPrefix}Finishing getAdHocCharge`);
    return charge;
  }

  /**
   * Get All AdHoc Charges from Tutor Cruncher
   *
   * @param page
   * @param pages
   * @returns {Promise<*[]>}
   */
  getAllAdHocCharges = async function (page, pages) {
    console.log(`${this._errorLogPrefix}Beginning getAllAdHocCharges`);
    let charges = await this.getAllFromTutorCruncher('adhoccharges', page, pages)
    console.log(`${this._errorLogPrefix}Finishing getAllAdHocCharges`);
    return charges;
  }

  /**
   * Get all the PFIs in the system with full details
   * WARNING, THIS WILL CREATE A LOT OF API REQUESTS
   *
   * @param delayIncrement - this will prevent all get requests firing at once
   * @param adHocChargeIdsArray
   * @returns {Promise<unknown[]>}
   */
  getFullAdHocCharges = async (adHocChargeIdsArray, delayIncrement = 300) => {
    console.log('Getting Full AdHocCharges');
    return await this.getFullItems(adHocChargeIdsArray, delayIncrement, this.getAdHocCharge);
  }

  /**
   * Get PFI by Id
   *
   * @param id
   * @returns {Promise<*[]>}
   */
  getPFI = async function (id) {
    console.log(`${this._errorLogPrefix}Beginning getPFI`);
    let charge = await this.getFromTC(`/proforma-invoices/${id}`)
    console.log(`${this._errorLogPrefix}Finishing getPFI`);
    return charge;
  }

  /**
   * Get All PFAs from Tutor Cruncher
   *
   * @param page
   * @param pages
   * @returns {Promise<*[]>}
   */
  getAllPFAs = async function (page, pages) {
    console.log(`${this._errorLogPrefix}Beginning getAllPFAs`);
    let pfas = await this.getAllFromTutorCruncher('proforma-invoices', page, pages)
    console.log(`${this._errorLogPrefix}Finishing getAllPFAs`);
    return pfas;
  }

  /**
   * Get all the PFIs in the system with full details
   * WARNING, THIS WILL CREATE A LOT OF API REQUESTS
   *
   * @param delayIncrement - this will prevent all get requests firing at once
   * @param pfiIdsArray
   * @returns {Promise<unknown[]>}
   */
  getFullPFIs = async (pfiIdsArray, delayIncrement = 300) => {
    console.log('Getting Full PFIs');
    return await this.getFullItems(pfiIdsArray, delayIncrement, this.getPFI);
  }

}

module.exports = PaymentUtilities;
