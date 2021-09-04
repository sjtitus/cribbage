/*______________________________________________________________________________
   apiCalls
      Backend API calls 
  ______________________________________________________________________________
*/
import { strict as assert } from 'assert'; 
import { GenerateAPIRequest } from './apiRequests.js';
import { GetModuleLogger } from '../utils/Logger.js';
import UserModel from '../shared/models/User.js';

const log = GetModuleLogger('apiCalls');

function _logApiError(msg, req, res) {
   log.error(`${msg}: ${res.error.message} (request ID=${req._id}, sent=${res.requestSent}, gotResponse=${res.responseReceived})`);
}

////______________________________________________________________________________
//// User API Calls
////______________________________________________________________________________

export async function GetLoggedInUser() {
   const req = GenerateAPIRequest('GetLoggedInUser'); 
   let user = UserModel.initialState; 
   log.debug(`GetLoggedInUser [${req._id}]`);
   const result = await req.run(); // run() will not throw 
   log.debug(`GetLoggedInUser [${req._id}]: complete (error=${!!result.error})`);
   if (result.error) {
      _logApiError('Failed to retrieve logged in user information', req, result);
   }
   else if (result.response.status === 202) { // User not logged in
      log.debug(`GetLoggedInUser [${req._id}]: not logged in`);
   }
   else {
      assert(result.response.status === 200); 
      log.debug(`GetLoggedInUser [${req._id}]: user is logged in`);
      // User logged in 
      const user = result.response.data;
   }
   return user;  
}

/*

// hit login endpoint to see if we're automatically logged in 
// (i.e. remembered by server)
function autoLogin(state) {
  log.info(`AutoLogin: enter state = ${JSON.stringify(state)}`);
  return {
   loginTime: '', 
   userID: -1, 
   firstName: '', 
   lastName: '' 
  };
}

return {
  loginTime: '2011-08-12T20:17:46.384Z',
  userID: 1,
  firstName: 'Steve',
  lastName: 'Titus'
}

// explicit login: send LoginRequest with authentication information
function login(state, payload) {
  log.info(`Login: enter state = ${JSON.stringify(state)}, payload = ${JSON.stringify(payload)}`);
  log.info('Login');
  return state;
}

// logout: tell server to log user out
function logout(state) {
  log.info('Logout');
  return state;
}

*/