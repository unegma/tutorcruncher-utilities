const { UnhandledArraySizeError } = require('./errors');
const BaseUtilities = require('./BaseUtilities');

/**
 * Lesson Utilities
 */
class LessonUtilities extends BaseUtilities {

  /**
   * Lesson Utilities
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
   * Get all the Lessons in the system with full details
   * WARNING, THIS WILL CREATE A LOT OF API REQUESTS
   *
   * @param delayIncrement - this will prevent all get requests firing at once
   * @param lessonIdsArray
   * @returns {Promise<unknown[]>}
   */
  getFullLessons = async (lessonIdsArray, delayIncrement = 300) => {
    console.log('Getting Full Lessons');
    return await this.getFullItems(lessonIdsArray, delayIncrement, this.getLesson.bind(this));
  }

  /**
   * Get All Lessons from Tutor Cruncher
   *
   * @param page
   * @param pages
   * @returns {Promise<*[]>}
   */
  getAllLessons = async function (page, pages) {
    console.log(`${this._errorLogPrefix}Beginning getAllLessons`);
    let lessons = await this.getAllFromTutorCruncher('appointments', page, pages)
    console.log(`${this._errorLogPrefix}Finishing getAllLessons`);
    return lessons;
  }

  /**
   * Get Lesson from Tutor Cruncher
   *
   * @param lessonId
   */
  getLesson = async function (lessonId) {
    console.log(`${this._errorLogPrefix}Beginning getLesson, Getting Lesson with Id: ${lessonId}`);
    const lesson = await this.getFromTC('/appointments/'+lessonId);
    if (typeof lesson === 'undefined') {
      throw new Error(`Lesson Not Found ${lessonId}`);
    }
    return lesson;
  }

  /**
   * TODO IF THERE ARE MORE THAN 100 LESSONS, WILL NEED TO DO MULITPLE API CALLS. SEPARATE THIS OUT INTO TC MODULE WITH DO WHILE LOOP - see getAllFromTutorCruncher()
   *
   * Tom: Note you can do the same (search by service id) for contractor (tutor), recipient (student) and location.
   * You can also include start__gte and start__lte for appointment.start is greater than or equal to X, and/or
   * appointment.start is less than or equal to X where X is a datetime.
   *
   * @param jobId
   * @returns {Promise<*>}
   */
  getJobLessons = async function (jobId) {
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
   * log an error if one fails and can make the rest manually?
   *
   * @param lessons
   * @param doPut
   * @returns {Promise<*>}
   */
  sendLessonsToTC = async function (lessons, doPut = false) {
    console.log("Sending Lessons to TC");
    let delay = 0; const delayIncrement = 1000; let promises;

    if (doPut === true) {
      promises = lessons.map(lesson => {
        delay += delayIncrement;
        return new Promise(resolve => setTimeout(resolve, delay)).then(() =>
            this.putToTC(`/appointments/${lesson.id}`, lesson));
      })
    } else {
      promises = lessons.map(lesson => {
        delay += delayIncrement;
        return new Promise(resolve => setTimeout(resolve, delay)).then(() =>
            this.postToTC('/appointments/', lesson));
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
  createTCLessonObject = function (name, jobId, recipientId, contractorId, start, finish, status, chargeType) {
    return {
      start: start,
      finish: finish,
      topic: name,
      // location: null, // does json stringify convert to "Null"?
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
}

module.exports = LessonUtilities;
