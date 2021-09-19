import { strict as assert } from 'assert';
import apiClient from '../utils/api/apiClient.js';

import { GetModuleLogger } from '../utils/Logger.js';
const log = GetModuleLogger('apiRequests');

log.debug(`get API instance`);
const api = apiClient.Instance();

// list of all the API requests
const apiRequests = {
   GetLoggedInUser: { 
      config: { method: 'get', url: '/user', withCredentials: true, headers: { accept: '*/*' } },
      request: null 
   },
   Login: {
      config: { method: 'post', url: '/users', headers: { accept: '*/*' } },
      request: null
   },
   Signup: {
      config: { method: 'post', url: '/users', headers: { accept: '*/*' } },
      request: null
   }
};

// lazy creation of API requests  
export function GenerateAPIRequest(reqName, body=null) {
   assert(reqName in apiRequests,`unrecognized API request: ${reqName}`);
   let req = apiRequests[reqName].request;
   let reqConfig = apiRequests[reqName].config;
   if (body) {
      reqConfig.data = body;
   }
   if (req === null) {
      log.debug(`constructing API request ${reqName}`);
      apiRequests[reqName].request = api.request(reqConfig);
   }
   else if (req._state !== 'new') {
      log.debug(`regenerating API request ${reqName}: (old [${req._id}] state is ${req._state})`);
      apiRequests[reqName].request = req.clone();
   }
   return apiRequests[reqName].request;
}
