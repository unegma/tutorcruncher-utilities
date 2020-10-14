const UnhandledArraySizeError = require('./errors').UnhandledArraySizeError;

/**
 * UTILITY FUNCTIONS
 */

/**
 * Get All Lessons from Tutor Cruncher
 *
 * @param page
 * @param pages
 * @returns {Promise<*[]>}
 */
module.exports.getAllLessons = async function (page, pages) {
  console.log(`### Beginning getAllLessons`);
  let clients = await this.getAllFromTutorCruncher('appointments', page, pages)
  console.log(`### Finishing getAllLessons`);
  return clients;
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
  let lessons = await this.getFromTC(`/appointments/?service=${jobId}`);
  if (lessons.next) {
    throw new UnhandledArraySizeError();
  }
  return lessons.results;
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
          this.putToTC(`/appointments/${lesson.id}`, lesson)); // TODO CHECK `THIS` CAREFULLY
    })
  } else {
    promises = lessons.map(lesson => {
      delay += delayIncrement;
      return new Promise(resolve => setTimeout(resolve, delay)).then(() =>
          this.postToTC('/appointments/', lesson)); // TODO CHECK `THIS` CAREFULLY
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
 * Low Level Functions
 */


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
