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

  /**
   * Create Recipient Object
   *
   * @param clientID
   * @param firstName
   * @param lastname
   * @param email
   * @param phone
   * @param address
   * @param state
   * @param city
   * @param country
   * @param postcode
   * @param timezone
   * @param calendarColour
   * @param extraAttributes
   * @returns {{calendar_colour: *, extra_attrs: *, user: {country: *, town: *, phone: *, street: *, timezone: string, mobile: *, postcode: *, last_name: *, state: *, first_name: *, email: *}, paying_client: *}}
   */
  createTCRecipientObject = function (clientID, firstName, lastname, email, phone, address, state, city,
                                      country = 183, postcode, timezone = '', calendarColour, extraAttributes) {
    return {
      user: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        mobile: phone,
        phone: phone,
        street: address, // address 1 and 2
        state: state,
        town: city,
        country: country,
        postcode: postcode,
        // latitude: ,
        // longitude: ,
        timezone: timezone // defaults to branch timezone
      },
      // default_rate: null,
      paying_client: clientID,
      // academic_year: null,
      calendar_colour: calendarColour,
      // labels: [],
      extra_attrs: extraAttributes
      // todo make sure send welcome email is no
    }
  }

}

module.exports = RecipientUtilities;
