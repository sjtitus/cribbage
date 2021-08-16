/*______________________________________________________________________________
  UserActions
      Actions taken by the user. Invoked via UserContext reducer.
  ______________________________________________________________________________
*/
import {GetModuleLogger} from '../utils/Logger.js';
const log = GetModuleLogger('UserActions');

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

/*
  return {
    loginTime: '2011-08-12T20:17:46.384Z',
    userID: 1,
    firstName: 'Steve',
    lastName: 'Titus'
  }
*/

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

const Actions = {
  'autoLogin':      autoLogin,
  'login':          login,
  'logout':         logout
} 

export default Actions;