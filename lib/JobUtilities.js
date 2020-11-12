const BaseUtilities = require('./BaseUtilities');

/**
 * Job Utilities
 * // todo rename to Service Utilities
 */
class JobUtilities extends BaseUtilities {

  /**
   * Job Utilities
   *
   * @param tutorCruncherApiKey
   * @param errorLogUrl
   * @param errorLogPrefix
   */
  constructor(tutorCruncherApiKey, errorLogUrl, errorLogPrefix) {
    super(tutorCruncherApiKey, errorLogUrl, errorLogPrefix);
  }

  /**
   * UTILITY FUNCTIONS
   */

  /**
   * Get Job from Tutor Cruncher
   *
   * @param jobId
   */
  getJob = async function (jobId) {
    console.log(`${this._errorLogPrefix}Beginning getJob, Getting Job with Id: ${jobId}`);
    const job = await this.getFromTC('/services/'+jobId);
    if (typeof job === 'undefined') {
      throw new Error(`Job Not Found ${jobId}`);
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
  postJob = async function (pupil, job) {
    console.log(`${this._errorLogPrefix}Adding Job for: ${pupil.first_name} ${pupil.last_name}`);
    const response = await this.postToTC('/services/', job);
    console.log(`${this._errorLogPrefix}Response = ${response}`);
    return response;
  }

  /**
   * Update Job
   *
   * @param job
   * @returns {Promise<*>}
   */
  updateJob = async function (job) {
    console.log(`${this._errorLogPrefix}Beginning updateJob with job ID ${job.id}`);
    const tcJobResponse = await this.putToTC('/services/'+job.id, job);
    console.log(`${this._errorLogPrefix}Finishing updateJob`);
    return tcJobResponse;
  }

  /**
   * Get All Jobs from Tutor Cruncher
   *
   * @param page
   * @param pages
   * @returns {Promise<*[]>}
   */
  getAllJobs = async function (page, pages) {
    console.log(`${this._errorLogPrefix}Beginning getAllJobs`);
    let clients = await this.getAllFromTutorCruncher('services', page, pages)
    console.log(`${this._errorLogPrefix}Finishing getAllJobs`);
    return clients;
  }

  /**
   * Get array of ids from array of jobs
   * @param jobsArray
   */
  getJobIds = (jobsArray) => {
    return [...new Set( jobsArray.map(job => job.id)) ];
  }

  /**
   * Get array of job ids from array of lessons
   * @param lessonsArray
   */
  getJobIdsFromLessons = (lessonsArray) => {
    return [...new Set( lessonsArray.map(lesson => lesson.service.id)) ];
  }

  /**
   * Get all the Jobs in the system with full details
   * WARNING, THIS WILL CREATE A LOT OF API REQUESTS
   *  have to do for now because can't do this: https://secure.tutorcruncher.com/api/services/?client=1069417
   *
   * @param delayIncrement - this will prevent all get requests firing at once
   * @param jobIdsArray
   * @returns {Promise<unknown[]>}
   */
  getFullJobs = async (jobIdsArray, delayIncrement = 300) => {
    let delay = 0;
    let jobPromises = jobIdsArray.map(jobId => {
      delay += delayIncrement;
      return new Promise(resolve => setTimeout(resolve, delay)).then(async () =>
          await this.getJob(jobId))
    });
    let fullJobs = await Promise.all(jobPromises);
    console.log('Got all Jobs');
    return fullJobs;
  }

  /**
   * Get all jobs for the client (using fullAJobsArray above)
   *
   * @param fullJobsArray
   * @param clientId
   * @returns {Promise<*>}
   */
  getClientJobs = (fullJobsArray, clientId) => {
    let clientJobs = fullJobsArray.map(job => {
      if (job.rcrs.length > 0) { // this filers out ended jobs (any charges will get picked up when invoicing)
        if (job.rcrs[0].paying_client === clientId) {
          return job;
        }
      }
    });
    // todo check there are multiple jobs for client returned if multiple jobs in system (only tested with 1 job)
    clientJobs = clientJobs.filter(function(el) { return el; }); // remove any undefined or null from array
    console.log(clientJobs);
    return clientJobs;
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
  stripJobObject = function (job, removeExtraAttrs) {
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
  createTCJobObject = function (name = "", price, tutorPay, studentId, colour,
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
}

module.exports = JobUtilities;
