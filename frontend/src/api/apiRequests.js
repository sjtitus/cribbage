import { strict as assert } from 'assert';
import apiClient from '../utils/api/apiClient.js';

import { GetModuleLogger } from '../utils/Logger.js';
const log = GetModuleLogger('apiRequests');

log.debug(`get API instance`);
const api = apiClient.Instance();

// list of all the API requests
const apiRequests = {
   GetLoggedInUser: null
};

// lazy creation of API requests  
export function GenerateAPIRequest(reqName) {
   assert(reqName in apiRequests,`unrecognized API request: ${reqName}`);
   let req = apiRequests[reqName]; 
   if (req === null) {
      log.debug(`creating API request: '${reqName}'`);
      switch (reqName) {
         // GetLoggedInUser
         case 'GetLoggedInUser':
            req = api.request({ method: 'get', url: '/user', headers: { accept: '*/*' } });
            break;
         // 
         default:
            log.error(`unrecognized API request: ${reqName}`);
            throw new Error(`unrecognized API request: ${reqName}`);
      }
      apiRequests[reqName] = req;
   }
   else if (req._state !== "new") {
      log.debug(`regenerating API request ${reqName}: (old [${req._id}] state is ${req._state})`);
      req = req.clone();
      apiRequests[reqName] = req;
   }
   return apiRequests[reqName];
}
