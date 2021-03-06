const TUTORCRUNCHER_API_URL = 'https://secure.tutorcruncher.com/api';
const fetch = require('node-fetch');
const { ErrorHandler } = require('@unegma/error-handler');
const { SlackErrorHandler } = require('@unegma/error-handler');
const { TutorCruncherIntegrationError } = require('./errors');
const utilities = require('@unegma/utilities');

/**
 * Base Utilities Class
 * todo create a class which implements all the utilities?
 */
class BaseUtilities {

  /**
   * Base Utilities
   *
   * errorLogPrefix will prefix the start and end of function console logs
   *
   * @param tutorCruncherApiKey
   * @param errorLogUrl
   * @param errorLogPrefix
   */
  constructor(tutorCruncherApiKey, errorLogUrl = "", errorLogPrefix = "## ") {
    this._tutorCruncherApiKey = tutorCruncherApiKey;
    this._errorLogUrl = errorLogUrl;
    this._errorLogPrefix = errorLogPrefix;

    // error logging
    if (this._errorLogUrl.includes('slack')) {
      this._errorHandler = new SlackErrorHandler(this._errorLogUrl);
    } else {
      this._errorHandler = new ErrorHandler();
    }
  }

  /**
   * API FUNCTIONS
   */

  /**
   * Low level GET from TC
   *
   * @param path
   * @param absolute
   * @returns {Promise<*>}
   */
  getFromTC = async (path, absolute = false) => {
    console.log(`${this._errorLogPrefix}Beginning getFromTC with path: ${path}`);
    try {
      let response;
      let url;
      if (absolute === false) {
        url = `${TUTORCRUNCHER_API_URL}${path}`;
      } else {
        url = path;
      }
      const params = {
        method: "get",
        headers: {
          "Authorization": "token " + this._tutorCruncherApiKey,
          "Content-Type": "application/json",
          "Accept": "application/json, text/plain, */*"
        }
      };

      response = await fetch(url, params);
      if (response.ok) {
        console.log(`${this._errorLogPrefix}Finished getFromTC with Response: ${response.status}, ${response.statusText}`);
        return response.json();
      } else {
        throw new TutorCruncherIntegrationError(await response.text());
      }
    } catch (error) {
      await this._errorHandler.handleError('getFromTC', 'Error communicating with TC.', error);
      throw new TutorCruncherIntegrationError(error.message);
    }
  }

  /**
   * Do POST request to TC
   *
   * @param path
   * @param data
   * @param absolute
   * @returns {Promise<*>}
   */
  postToTC = async (path, data, absolute = false) => {
    console.log(`${this._errorLogPrefix}Beginning postToTC with path: ${path}`);
    try {
      let response;
      let url;

      if (absolute === false) {
        url = `${TUTORCRUNCHER_API_URL}${path}`;
      } else {
        url = path;
      }

      const params = {
        method: "post",
        headers: {
          "Authorization": "token " + this._tutorCruncherApiKey,
          "Content-Type": "application/json",
          "Accept": "application/json, text/plain, */*"
        },
        body: JSON.stringify(data)
      };

      response = await fetch(url, params); // cant console log here, uses up the stream? await tcJobPostResponse.json()
      if (response.ok) {
        console.log(`${this._errorLogPrefix}Finished postToTC with Response: ${response.status}, ${response.statusText}`);
        return response.json();
      } else {
        throw new TutorCruncherIntegrationError(await response.text());
      }
    } catch (error) {
      // good to have error handling here, because otherwise, one failed e.g. lesson updating, would break the
      // whole script (this way can log and redo just one)
      await this._errorHandler.handleError('postToTC', 'Tutor Cruncher Integration Error', error);
      throw new TutorCruncherIntegrationError(error.message);
    }
  }

  /**
   * Do PUT request to TC
   *
   * @param path
   * @param data
   * @param absolute
   * @returns {Promise<*>}
   */
  putToTC = async (path, data, absolute = false) => {
    console.log(`${this._errorLogPrefix}Beginning putToTC with path: ${path}`);
    try {
      let response;
      let url;

      if (absolute === false) {
        url = `${TUTORCRUNCHER_API_URL}${path}`;
      } else {
        url = path;
      }

      const params = {
        method: "put",
        headers: {
          "Authorization": "token " + this._tutorCruncherApiKey,
          "Content-Type": "application/json",
          "Accept": "application/json, text/plain, */*"
        },
        body: JSON.stringify(data)
      };

      response = await fetch(url, params); // cant console log here, uses up the stream? await tcJobPostResponse.json()
      if (response.ok) {
        console.log(`${this._errorLogPrefix}Finished putToTC with Response: ${response.status}, ${response.statusText}`);
        return response.json();
      } else {
        throw new TutorCruncherIntegrationError(await response.text());
      }
    } catch (error) {
      await this._errorHandler.handleError('putToTC', 'Error communicating with TC.', error);
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
  getAllFromTutorCruncher = async (type, page, pages = 1) => {
    console.log(`${this._errorLogPrefix}Beginning getAllFromTutorCruncher`);
    let data = [];
    let result;
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
    console.log(`${this._errorLogPrefix}Finishing getAllFromTutorCruncher`);
    return data;
  }

  /**
   * Get full items in the tc system with full details
   * WARNING, THIS WILL CREATE A LOT OF API REQUESTS
   *
   * @param delayIncrement - this will prevent all get requests firing at once
   * @param idsArray
   * @param getFunction
   * @param logOutput
   * @returns {Promise<unknown[]>}
   */
  getFullItems = async (idsArray, delayIncrement = 300, getFunction, logOutput = false) => {
    console.log('Beginning get full items WARNING THIS COULD CAUSE A LOT OF API CALLS');
    let delay = 0;
    let promises = idsArray.map((id, index) => {
      delay += delayIncrement;
      return new Promise(resolve => setTimeout(resolve, delay)).then(async () => {
        if (logOutput === true) {
          console.log(`Record ${index+1}`);
        }
        return await getFunction(id);
      })
    });
    let fullItems = await Promise.all(promises);
    console.log('Finished getting full items');
    return fullItems;
  }

  /**
   * LOW LEVEL FUNCTIONS
   */

  /**
   * Return Attribute Value
   * extraAttributes will either be an array or an object. It will usually be an object if passed after stripping
   * the original extra attributes, ready for a post request
   *
   * @param extraAttributes
   * @param key
   * @returns {*|null}
   */
  getAttValue = function (extraAttributes, key) {
    return utilities.getAttValue(extraAttributes, key);
  }

  // used for testing
  throwError() {
    throw new TutorCruncherIntegrationError();
  }

}

module.exports = BaseUtilities;
