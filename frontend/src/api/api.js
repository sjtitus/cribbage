/*_____________________________________________________________________________
  APIClient
  API that calls backend. Uses axios.
  _____________________________________________________________________________
*/
import axios from 'axios';

import Logger from '../utils/Logger';
const log = Logger.child({module:'api'});


class APIClient {

  constructor(baseURL, timeout) {
    log.info(`construct APIClient: baseURL=${baseURL}, timeout=${timeout}`);
    this.api = axios.create({
      baseURL: baseURL,
      timeout: timeout,
      //headers: {'X-Custom-Header': 'foobar'}
    });
    api.defaults.headers.post['Content-Type'] = 'application/json';
  }

  // Log in to the cribbage server
  Login( loginInfo, cbSuccess, cbError, cbComplete=null ) {
    this.axios.post('/users/authenticate', loginInfo)
    .then( function(response) {
      log.info(`API:Login: success`);
      cbSuccess(response);
    })
    .catch( function (error) {
      log.info(`API:Login: error`);
      cbError(error);
    })
    .finally( function() {
      log.info(`API:Login: complete`);
      if (cbComplete) {
        cbComplete();
      }
    });
  }

  CreateUser( createInfo, cbSuccess, cbError, cbComplete=null ) {
    this.axios.post( '/users/register', createInfo)
    .then( function(response) {
      log.info(`API:Create: success`);
      cbSuccess(response);
    })
    .catch( function (error) {
      log.info(`API:Create: error`);
      cbError(error);
    })
    .finally( function() {
      log.info(`API:Create: complete`);
      if (cbComplete) {
        cbComplete();
      }
    });
  }

}

//https://postman-echo.com/post

let api = new APIClient('http://localhost:3000/api/', 60000);
export default api;