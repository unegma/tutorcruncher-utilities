const {
  TUTORCRUNCHER_KEY,
  TUTORCRUNCHER_URL,
} = process.env;
const fetch = require('node-fetch');
const errorhandler = require('../slackIntegrations/index');
const awsLib = require('../awsIntegrations/index');
const TutorCruncherIntegrationError = require('../Errors').TutorCruncherIntegrationError;
const UnhandledArraySizeError = require('../Errors').UnhandledArraySizeError;

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

/**
 * UTILITY FUNCTIONS
 */

/**
 * Post job to Tutor Cruncher
 *
 * @param pupil
 * @param job
 * @returns {Promise<void>}
 */
module.exports.postJob = async function (pupil, job) {
  console.log(`Adding Job for: ${pupil.first_name} ${pupil.last_name}`);
  const response = await this.postToTC('/api/services/', job); // todo check `this`
  console.log(`Response = ${response}`);
  return response;
}

/**
 * Get Job from Tutor Cruncher
 *
 * @param jobId
 */
module.exports.getJob = async function (jobId) {
  console.log(`### Beginning getJob, Getting Job with Id: ${jobId}`);
  const job = await this.getFromTC('/api/services/'+jobId); // todo test `this`
  if (typeof job === 'undefined') {
    throw new Error(`Job Not Found ${jobId}`); // todo test // todo better to return null?
  }
  return job;
}

/**
 * Get Client from Tutor Cruncher
 *
 * @param clientId
 */
module.exports.getClient = async function (clientId) {
  console.log(`### Beginning getClient, Getting Client with Id: ${clientId}`);
  const client = await this.getFromTC('/api/clients/'+clientId); // todo check `this`
  if (typeof client === 'undefined') {
    throw new Error(`Client Not Found ${clientId}`); // todo test // todo better to return null?
  }
  console.log('### Finishing getClient');
  return client;
}

/**
 * Get All Clients from Tutor Cruncher
 */
module.exports.getAllClients = async function (page) {
  console.log(`### Beginning getAllClients`);
  let clients = await this.getAllFromTutorCruncher('clients', page)
  console.log(`### Finishing getAllClients`);
  return clients;
}

/**
 * Get All Jobs from Tutor Cruncher
 */
module.exports.getAllJobs = async function (page) {
  console.log(`### Beginning getAllJobs`);
  let clients = await this.getAllFromTutorCruncher('services', page)
  console.log(`### Finishing getAllJobs`);
  return clients;
}

/**
 * Get All Lessons from Tutor Cruncher
 */
module.exports.getAllLessons = async function (page) {
  console.log(`### Beginning getAllLessons`);
  let clients = await this.getAllFromTutorCruncher('appointments', page)
  console.log(`### Finishing getAllLessons`);
  return clients;
}

/**
 * Low level function for getting all of a type from Tutor Cruncher
 * Optionally use the page parameter to get a specific page (useful for debugging)
 *
 * @param type
 * @param page
 * @returns {Promise<*[]>}
 */
module.exports.getAllFromTutorCruncher = async function (type, page) {
  console.log(`#### Beginning getAllFromTutorCruncher`);
  let data = []; let result;
  if (page ) {
    data = await this.getFromTC(`/api/${type}/?page=${page}`);
  } else {
    do {
      if (result && result.next) {
        result = await this.getFromTC(result.next, true);
      } else {
        result = await this.getFromTC(`/api/${type}/`);
      }
      data = data.concat(result.results);
      console.log(`Data length: ${data.length}`)
    }
    while (result.next);
  }
  console.log(`#### Finishing getAllFromTutorCruncher`);
  return data;
}


/**
 * If you are using Promise.all() it will also "fast-fail" - stop running at the time of the first failure of any of
 * the included functions
 * https://stackoverflow.com/questions/45285129/any-difference-between-await-promise-all-and-multiple-await
 *
 * todo can we do rollback if one fails, or maybe we just log an error, and the admin team make the rest manually?
 * todo how is error handling working as there is a separate try in the other module (check erroring)
 *
 * @param lessons
 * @param doPut
 * @returns {Promise<*>}
 */
module.exports.sendLessonsToTC = async function (lessons, doPut = false) {
  console.log("Sending Lessons to TC");
  let delay = 0; const delayIncrement = 1000; let promises;

  if (doPut === true) {
    promises = lessons.map(lesson => {
      delay += delayIncrement;
      return new Promise(resolve => setTimeout(resolve, delay)).then(() =>
          this.putToTC(`/api/appointments/${lesson.id}`, lesson)); // TODO CHECK `THIS` CAREFULLY
    })
  } else {
    promises = lessons.map(lesson => {
      delay += delayIncrement;
      return new Promise(resolve => setTimeout(resolve, delay)).then(() =>
          this.postToTC('/api/appointments/', lesson)); // TODO CHECK `THIS` CAREFULLY
    })
  }

  let results = await Promise.all(promises);

  console.log('Results in sendLessonsToTC');
  results.forEach(res => {
    console.log(res);
  })
  console.log("Finished sending lessons to TC");
  return results;
}

/**
 * TODO IF THERE ARE MORE THAN 100 LESSONS, WILL NEED TO DO MULITPLE API CALLS. SEPARATE THIS OUT INTO TC MODULE WITH DO WHILE LOOP
 *
 * Tom: Note you can do the same (search by service id) for contractor (tutor), recipient (student) and location.
 * You can also include start__gte and start__lte for appointment.start is greater than or equal to X, and/or
 * appointment.start is less than or equal to X where X is a datetime.
 *
 * @param jobId
 * @returns {Promise<*>}
 */
module.exports.getJobLessons = async function (jobId) {
  let lessons = await this.getFromTC(`/api/appointments/?service=${jobId}`);
  if (lessons.next) {
    throw new UnhandledArraySizeError();
  }
  return lessons.results;
}


/**
 * API FUNCTIONS
 */

/**
 * Low level GET from TC
 * todo will want to add get parameters as they can be used (such as in update lessons) to get lessons by job id
 *
 * @param path
 * @param absolute
 * @returns {Promise<*>}
 */
module.exports.getFromTC = async (path, absolute = false) => {
  console.log(`## Beginning getFromTC with path: ${path}`);
  try {
    let response; let url;
    if (absolute === false ) {
      url = `${TUTORCRUNCHER_URL}${path}`;
    } else {
      url = path;
    }
    const params = {
      method: "get",
      headers: {
        "Authorization": "token " + TUTORCRUNCHER_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*"
      }
    };

    response = await fetch(url, params);
    if (response.ok) {
      console.log(`## Finished getFromTC with Response: ${response.status}, ${response.statusText}`);
      return response.json();
    } else {
      throw new TutorCruncherIntegrationError(await response.text()); // todo check what happens here now posting stack track to slack
    }
  } catch (error) {
    await errorhandler.handleError('getFromTC', 'Error communicating with TC.', error);
    throw new TutorCruncherIntegrationError(error.message);
  }
}

/**
 * Do POST request to TC or SQS
 *
 * @param path
 * @param data
 * @param absolute
 * @param useQueue
 * @returns {Promise<*>}
 */
module.exports.postToTC = async (path, data, absolute = false, useQueue = false) => {
  console.log(`## Beginning postToTC with path: ${path} and useQueue ${useQueue}`);
  try {
    let response; let url;

    if (absolute === false ) {
      url = `${TUTORCRUNCHER_URL}${path}`;
    } else {
      url = path;
    }
    // if useQueue === true, then there is less margin for error, because checking against an exact condition as opposed
    // to what could be something that is falsy (like null).
    // if you pass in null, this check doesn't work if !== true (and as skipQueue)
    if (useQueue === true) {
      response = await awsLib.postToSQS({ method: 'post', path: path, data: data, url: url }); // stringified within
      console.log(`## Finished postToTC with Response: ${response}`);
      return response;
    } else {
      const params = {
        method: "post",
        headers: {
          "Authorization": "token " + TUTORCRUNCHER_KEY,
          "Content-Type": "application/json",
          "Accept": "application/json, text/plain, */*"
        },
        body: JSON.stringify(data)
      };

      response = await fetch(url, params); // cant console log here, uses up the stream? await tcJobPostResponse.json()
      if (response.ok) {
        console.log(`## Finished postToTC with Response: ${response.status}, ${response.statusText}`);
        return response.json();
      } else {
        // can't return throw new Error so will always have 2 slack notifications if called from Lambda
        throw new TutorCruncherIntegrationError(await response.text());  // todo check what happens here now posting stack track to slack
      }
    }
  } catch (error) {
    await errorhandler.handleError('postToTC', 'Tutor Cruncher Integration Error', error);
    throw new TutorCruncherIntegrationError(error.message);
  }
}

/**
 * Do PUT request to TC or SQS
 *
 * @param path
 * @param data
 * @param absolute
 * @param useQueue
 * @returns {Promise<*>}
 */
module.exports.putToTC = async (path, data, absolute = false, useQueue = false) => {
  console.log(`## Beginning putToTC with path: ${path} and useQueue ${useQueue}`);
  try {
    let response; let url;

    if (absolute === false ) {
      url = `${TUTORCRUNCHER_URL}${path}`;
    } else {
      url = path;
    }

    if (useQueue === true) {
      response = await awsLib.postToSQS({ method: 'put', path: path, data: data, url: url }); // stringified within
      console.log(`## Finished putToTC with Response: ${response}`);
      return response;
    } else {
      const params = {
        method: "put",
        headers: {
          "Authorization": "token " + TUTORCRUNCHER_KEY,
          "Content-Type": "application/json",
          "Accept": "application/json, text/plain, */*"
        },
        body: JSON.stringify(data)
      };

      response = await fetch(url, params); // cant console log here, uses up the stream? await tcJobPostResponse.json()
      if (response.ok) {
        console.log(`## Finished putToTC with Response: ${response.status}, ${response.statusText}`);
        return response.json();
      } else {
        // can't return throw new Error so will always have 2 slack notifications if called from Lambda
        throw new TutorCruncherIntegrationError(await response.text());  // todo check what happens here now posting stack track to slack
      }
    }
  } catch (error) {
    await errorhandler.handleError('putToTC', 'Error communicating with TC.', error);
    throw new TutorCruncherIntegrationError(error.message);
  }
}

/**
 * LOW LEVEL FUNCTIONS
 */

/**
 * Return Attribute Value
 *
 * @param extraAttributes
 * @param key
 * @returns {*|null}
 */
module.exports.getAttValue = function (extraAttributes, key) {
  const attribute = extraAttributes.find(xA => xA.machine_name === key);
  // returning undefined will allow default parameters to be used when calling functions maxHours = ""
  return attribute !== undefined ? attribute.value : undefined;
}

/**
 * Objects
 */

/**
 * Create Lesson object
 * todo turn into an extendable class
 *
 * Need to add extra_attrs separately as they are organisation specific
 */
module.exports.createTCLessonObject = function (name, jobId, recipientId, contractorId, start, finish, status, chargeType) {
  return {
    start: start,
    finish: finish,
    topic: name,
    // location: null, // todo does json stringify convert to "Null"?
    extra_attrs: {},
    rcras: [
      {
        recipient: recipientId,
      }],
    cjas:[
      {
        contractor: contractorId,
      }],
    status: status,
    service: jobId,
    charge_type: chargeType
  }
}

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
