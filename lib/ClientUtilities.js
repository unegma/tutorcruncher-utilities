const BaseUtilities = require('./BaseUtilities');

/**
 * Client Utilities
 */
class ClientUtilities extends BaseUtilities {

  /**
   * Client Utilities
   *
   * @param tutorCruncherApiKey
   * @param errorLogUrl
   * @param errorLogPrefix
   */
  constructor(tutorCruncherApiKey, errorLogUrl, errorLogPrefix) {
    super(tutorCruncherApiKey, errorLogUrl, errorLogPrefix);
  }

  /**
   * Get Client from Tutor Cruncher
   *
   * @param clientId
   */
  getClient = async function (clientId) {
    console.log(`${this._errorLogPrefix}Beginning getClient, Getting Client with Id: ${clientId}`);
    const client = await this.getFromTC('/clients/'+clientId);
    if (typeof client === 'undefined') {
      throw new Error(`Client Not Found ${clientId}`);
    }
    console.log(`${this._errorLogPrefix}Finishing getClient`);
    return client;
  }

  /**
   * UTILITY FUNCTIONS
   */

  /**
   * Get All Clients from Tutor Cruncher
   *
   * @param page
   * @param pages
   * @returns {Promise<*[]>}
   */
  getAllClients = async function (page, pages) {
    console.log(`${this._errorLogPrefix}Beginning getAllClients`);
    let clients = await this.getAllFromTutorCruncher('clients', page)
    console.log(`${this._errorLogPrefix}Finishing getAllClients`);
    return clients;
  }

  /**
   * Low Level Functions
   */

  /**
   * Remove Problem fields when POSTing back a client after a GET
   * Could just reconstruct the object and post only the required fields
   * May be better to deep clone with only the required fields: user.last_name user.email?
   *
   * @param client
   * @param removeExtraAttrs
   */
  stripClientObject = function (client, removeExtraAttrs) {
    delete client.user.country;
    delete client.auto_charge;
    delete client.associated_admin;
    delete client.associated_agent;
    if (removeExtraAttrs) {
      delete client.extra_attrs;
    }
  }

  /**
   * Create TC Client Object
   *
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
   * @param status
   * @param isTaxable
   * @param chargeViaBranch
   * @param calendarColour
   * @param extraAttributes
   * @returns {{send_emails: boolean, calendar_colour: *, extra_attrs: *, change_via_branch: *, user: {country: number, town: *, phone: *, street: *, timezone: string, mobile: *, postcode: *, last_name: *, state: *, first_name: *, email: *}, is_taxable: *, status: *}}
   */
  createTCClientObject = function (firstName, lastName, email, phone, address, state,
                                   city, country = 183, postcode, timezone = '',
                                   status, isTaxable, chargeViaBranch, calendarColour, extraAttributes) {
    return {
      user: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        mobile: phone,
        phone: phone,
        street: address, // line1 and line2
        state: state,
        town: city,
        country: country,
        postcode: postcode,
        // latitude: ,
        // longitude: ,
        timezone: timezone // defaults to branch timezone
      },
      status: status,
      is_taxable: isTaxable,
      change_via_branch: chargeViaBranch,
      calendar_colour: calendarColour,
      extra_attrs: extraAttributes,
      send_emails: false // todo make sure this is the same as sendWelcomeEmail
    }
  }
}

module.exports = ClientUtilities;
