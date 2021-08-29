/*______________________________________________________________________________
   apiCalls
      Backend API calls 
  ______________________________________________________________________________
*/
import { GenerateAPIRequest } from './apiRequests.js';
import { GetModuleLogger } from '../utils/Logger.js';
const log = GetModuleLogger('apiCalls');

////______________________________________________________________________________
//// User API Calls
////______________________________________________________________________________

export async function GetLoggedInUser() {
   const req = GenerateAPIRequest('GetLoggedInUser'); 
   log.debug(`run request [${req._id}] GetLoggedInUser (${JSON.stringify(req)})`);
   // run() will not throw 
   const result = await req.run();
   log.debug(`run request [${req._id}] GetLoggedInUser complete (error=${result.error})`);
   // handle errors
   if (result.error) {
   }
   else {

   }
   return result;
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