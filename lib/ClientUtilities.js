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
}

module.exports = ClientUtilities;
