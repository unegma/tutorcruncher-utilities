/**
 * UTILITY FUNCTIONS
 */

/**
 * Get AdHocCharge by Id
 *
 * @param id
 * @returns {Promise<*[]>}
 */
module.exports.getAdHocCharge = async function (id) {
  console.log(`### Beginning getAdHocCharge`);
  let charge = await this.getFromTC(`/adhoccharges/${id}`)
  console.log(`### Finishing getAdHocCharge`);
  return charge;
}

/**
 * Get All AdHoc Charges from Tutor Cruncher
 *
 * @param page
 * @param pages
 * @returns {Promise<*[]>}
 */
module.exports.getAllAdHocCharges = async function (page, pages) {
  console.log(`### Beginning getAllAdHocCharges`);
  let charges = await this.getAllFromTutorCruncher('adhoccharges', page, pages)
  console.log(`### Finishing getAllAdHocCharges`);
  return charges;
}
