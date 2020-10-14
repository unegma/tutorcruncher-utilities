/**
 * Get Client from Tutor Cruncher
 *
 * @param clientId
 */
module.exports.getClient = async function (clientId) {
  console.log(`### Beginning getClient, Getting Client with Id: ${clientId}`);
  const client = await this.getFromTC('/clients/'+clientId); // todo check `this`
  if (typeof client === 'undefined') {
    throw new Error(`Client Not Found ${clientId}`); // todo test // todo better to return null?
  }
  console.log('### Finishing getClient');
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
module.exports.getAllClients = async function (page, pages) {
  console.log(`### Beginning getAllClients`);
  let clients = await this.getAllFromTutorCruncher('clients', page)
  console.log(`### Finishing getAllClients`);
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
module.exports.stripClientObject = function (client, removeExtraAttrs) {
  delete client.user.country;
  delete client.auto_charge;
  delete client.associated_admin;
  delete client.associated_agent;
  if (removeExtraAttrs) {
    delete client.extra_attrs;
  }
}
