const BaseUtilities = require('./BaseUtilities');

/**
 * Contractor Utilities
 */
class ContractorUtilities extends BaseUtilities {

  /**
   * Contractor Utilities
   *
   * @param tutorCruncherApiKey
   * @param errorLogUrl
   * @param errorLogPrefix
   */
  constructor(tutorCruncherApiKey, errorLogUrl, errorLogPrefix) {
    super(tutorCruncherApiKey, errorLogUrl, errorLogPrefix);
  }

  /**
   * Get Contractor from Tutor Cruncher
   *
   * @param contractorId
   */
  getContractor = async function (contractorId) {
    console.log(`${this._errorLogPrefix}Beginning getContractor, Getting Contractor with Id: ${contractorId}`);
    const contractor = await this.getFromTC('/contractors/'+contractorId);
    if (typeof contractor === 'undefined') {
      throw new Error(`Contractor Not Found ${contractorId}`);
    }
    console.log(`${this._errorLogPrefix}Finishing getContractor`);
    return contractor;
  }

  /**
   * UTILITY FUNCTIONS
   */

  /**
   * Get All Contractors from Tutor Cruncher
   *
   * @param page
   * @param pages
   * @returns {Promise<*[]>}
   */
  getAllContractors = async function (page, pages) {
    console.log(`${this._errorLogPrefix}Beginning getAllContractors`);
    let contractors = await this.getAllFromTutorCruncher('contractors', page)
    console.log(`${this._errorLogPrefix}Finishing getAllContractors`);
    return contractors;
  }

  /**
   * Get all the Contractors in the system with full details
   * WARNING, THIS WILL CREATE A LOT OF API REQUESTS
   *
   * @param delayIncrement - this will prevent all get requests firing at once
   * @param contractorIdsArray
   * @returns {Promise<unknown[]>}
   */
  getFullContractors = async (contractorIdsArray, delayIncrement = 300) => {
    console.log('Getting Full Contractors');
    return await this.getFullItems(contractorIdsArray, delayIncrement, this.getContractor.bind(this));
  }

  /**
   * Low Level Functions
   */

}

module.exports = ContractorUtilities;
