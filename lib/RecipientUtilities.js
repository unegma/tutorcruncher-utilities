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
   * Same as getRecipient
   * @param student
   * @returns {Promise<void>}
   */
  getStudent = async (student) => {
    return await this.getRecipient(student);
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
   * Same as createRecipient
   * @param student
   * @returns {Promise<void>}
   */
  createStudent = async (student) => {
    return await this.createRecipient(student);
  }

  /**
   * Post recipient to Tutor Cruncher
   *
   * @param recipient
   * @returns {Promise<void>}
   */
  createRecipient = async function (recipient) {
    console.log(`${this._errorLogPrefix}Beginning createRecipient, Adding Recipient: ${recipient.email}`);
    const response = await this.postToTC('/recipients/', recipient);
    console.log(`${this._errorLogPrefix}Response = ${response}`);
    console.log(`${this._errorLogPrefix}Finishing createClient`);
    return response;
  }

  /**
   * Same as updateRecipient
   * @param student
   * @returns {Promise<void>}
   */
  updateStudent = async (student) => {
    return await this.updateRecipient(student);
  }

  /**
   * Update Recipient
   *
   * @param recipient
   */
  updateRecipient = async function (recipient) {
    console.log(`${this._errorLogPrefix}Beginning updateClient, Client with Id: ${recipient.id}`);
    const tcRecipientResponse = await this.postToTC('/recipients/', recipient); // recipient current using post not put
    console.log(`Client Response: ${tcRecipientResponse}`);
    console.log(`${this._errorLogPrefix}Finishing updateClient`);
    return tcRecipientResponse;
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
   * Get academic year index
   *
   * @param academicYear
   */
  getAcademicYearIndex = function (academicYear) {
    const yearIndexes = [
      {id: 0, year: 'Reception'},
      {id: 1, year: 'Year 1'},
      {id: 2, year: 'Year 2'},
      {id: 3, year: 'Year 3'},
      {id: 4, year: 'Year 4'},
      {id: 5, year: 'Year 5'},
      {id: 6, year: 'Year 6'},
      {id: 7, year: 'Year 7'},
      {id: 8, year: 'Year 8'},
      {id: 9, year: 'Year 9'},
      {id: 10, year: 'Year 10'},
      {id: 11, year: 'Year 11'},
      {id: 12, year: 'Year 12'},
      {id: 13, year: 'Year 13'},
    ];

    let result = yearIndexes.find(yI => academicYear === yI.year );
    return typeof result !== 'undefined' ? result.id : null;
  }

  /**
   * Create Recipient Object
   *
   * @param clientID
   * @param firstName
   * @param lastName
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
  createTCRecipientObject = function (clientID, firstName, lastName, email, phone, address, state, city,
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
