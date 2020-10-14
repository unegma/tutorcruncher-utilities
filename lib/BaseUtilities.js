const {
  TUTORCRUNCHER_KEY,
  TUTORCRUNCHER_URL,
} = process.env;
const fetch = require('node-fetch');
const errorhandler = require('../slackIntegrations/index');
const awsLib = require('../awsIntegrations/index');
const TutorCruncherIntegrationError = require('../Errors').TutorCruncherIntegrationError;

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
      url = `${TUTORCRUNCHER_URL}${path}`; // todo move /api to here
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
    // good to have error handling here, because otherwise, one failed e.g. lesson updating, would break the whole script (this way can log and redo just one)
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
 * Low level function for getting all of a type from Tutor Cruncher
 * Optionally use the page parameter to get a specific page (useful for debugging)
 *
 * @param type
 * @param page
 * @param pages
 * @returns {Promise<*[]>}
 */
module.exports.getAllFromTutorCruncher = async function (type, page, pages = 1) {
  console.log(`#### Beginning getAllFromTutorCruncher`);
  let data = []; let result;
  if (page) {
    let i = 0;
    page = (typeof page == 'number') ? page : 1;
    do {
      if (result && result.next) {
        result = await this.getFromTC(result.next, true);
      } else {
        result = await this.getFromTC(`/${type}/?page=${page}`);
      }
      data = data.concat(result.results);
      console.log(`Data length: ${data.length}`)
      i++;
    }
    while (i < pages);
  } else { // default, get ALL
    do {
      if (result && result.next) {
        result = await this.getFromTC(result.next, true);
      } else {
        result = await this.getFromTC(`/${type}/`);
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
