const BaseUtilities = require('./BaseUtilities');

/**
 * Recipient Utilities
 */
class RecipientUtilities extends BaseUtilities {

  /**
   * Recipient Utilities
   *
   * @param tutorCruncherApiKey
   * @param errorLogUrl
   * @param errorLogPrefix
   */
  constructor(tutorCruncherApiKey, errorLogUrl, errorLogPrefix) {
    super(tutorCruncherApiKey, errorLogUrl, errorLogPrefix);
  }

  /**
   * Get Recipient from Tutor Cruncher
   *
   * @param recipientId
   */
  getRecipient = async function (recipientId) {
    console.log(`${this._errorLogPrefix}Beginning getRecipient, Getting Recipient with Id: ${recipientId}`);
    const recipient = await this.getFromTC('/recipients/'+recipientId);
    if (typeof recipient === 'undefined') {
      throw new Error(`Recipient Not Found ${recipientId}`);
    }
    console.log(`${this._errorLogPrefix}Finishing getRecipient`);
    return recipient;
  }

  /**
   * UTILITY FUNCTIONS
   */

  /**
   * Get All Recipients from Tutor Cruncher
   *
   * @param page
   * @param pages
   * @returns {Promise<*[]>}
   */
  getAllRecipients = async function (page, pages) {
    console.log(`${this._errorLogPrefix}Beginning getAllRecipients`);
    let recipients = await this.getAllFromTutorCruncher('recipients', page)
    console.log(`${this._errorLogPrefix}Finishing getAllRecipients`);
    return recipients;
  }

  /**
   * Low Level Functions
   */

}

module.exports = RecipientUtilities;
