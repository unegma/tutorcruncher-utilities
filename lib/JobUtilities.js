/**
 * UTILITY FUNCTIONS
 */

/**
 * Get Job from Tutor Cruncher
 *
 * @param jobId
 */
module.exports.getJob = async function (jobId) {
  console.log(`### Beginning getJob, Getting Job with Id: ${jobId}`);
  const job = await this.getFromTC('/services/'+jobId); // todo test `this`
  if (typeof job === 'undefined') {
    throw new Error(`Job Not Found ${jobId}`); // todo test // todo better to return null?
  }
  return job;
}

/**
 * Post job to Tutor Cruncher
 *
 * @param pupil
 * @param job
 * @returns {Promise<void>}
 */
module.exports.postJob = async function (pupil, job) {
  console.log(`Adding Job for: ${pupil.first_name} ${pupil.last_name}`);
  const response = await this.postToTC('/services/', job); // todo check `this`
  console.log(`Response = ${response}`);
  return response;
}

/**
 * Get All Jobs from Tutor Cruncher
 *
 * @param page
 * @param pages
 * @returns {Promise<*[]>}
 */
module.exports.getAllJobs = async function (page, pages) {
  console.log(`### Beginning getAllJobs`);
  let clients = await this.getAllFromTutorCruncher('services', page, pages)
  console.log(`### Finishing getAllJobs`);
  return clients;
}

/**
 * Low Level Functions
 */

/**
 * Remove fields which cause problems with updates when posting to api
 *
 * seems fine to not delete: job.con_jobs, job.labels, job.rcrc
 * (posting a single extra_attrs, will update that one)
 * @param job
 * @param removeExtraAttrs
 */
module.exports.stripJobObject = function (job, removeExtraAttrs) {
  delete job.branch_tax_setup; // problem with branch_tax_setup (wants pk)
  delete job.contractor_tax_setup; // problem with contractor_tax_setup (wants pk)
  if (removeExtraAttrs) {
    delete job.extra_attrs; // problem with extra_attrs (expected dictionary but got list)
  }
}

/**
 * Objects
 */

/**
 * Create Job Object
 * todo turn into an extendable class
 *
 * @param name
 * @param price
 * @param tutorPay
 * @param studentId
 * @param colour
 * @param status
 * @param chargeType
 * @param contractorPermissions
 * @param maxStudents
 * @returns {{colour: *, dft_contractor_rate: *, allow_proposed_rates: boolean, dft_contractor_permissions: string, require_rcr: boolean, extra_attrs: {}, rcrs: [{recipient: *}], name: string, dft_charge_rate: *, dft_max_srs: number, dft_charge_type: string, status: string}}
 */
module.exports.createTCJobObject = function (name = "", price, tutorPay, studentId, colour,
                                             status = "pending", chargeType = "one-off", contractorPermissions = "complete",
                                             maxStudents = 1) {
  return {
    allow_proposed_rates: false,
    rcrs: [{
      recipient: studentId,
    }],
    name: name,
    require_rcr: true,
    dft_max_srs: maxStudents,
    status: status,
    colour: colour,
    dft_charge_type: chargeType,
    dft_charge_rate: price,
    dft_contractor_permissions: contractorPermissions,
    dft_contractor_rate: tutorPay,
    extra_attrs: {}
  };
}
