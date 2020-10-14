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
}

module.exports = PaymentUtilities;
