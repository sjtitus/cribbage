/*______________________________________________________________________________
  UserContext

    Provides application-global user state. 
    
    Usage:
        import { UserContext, UserContextProvider } from userContext;

    Provide the context to children:
      <UserContextProvider> ... </UserContextProvider>

    Use the context in a child 
        const userContext = useContext(UserContext);
        {state, dispatch} = userContext;
        state = current user state (see below)
        dispatch = dispatch function (see useReducer)
    
    Dispatch Actions: login and logout
        userContext.dispatch( {type: 'logout'} );
        userContext.dispatch( {type: 'login', token: <authToken>} );

    UserState (from UserState):
        {
          loginTime: timestamp 
          userID: number
          firstName: string
          lastName: string 
        }
  ______________________________________________________________________________
*/
import React, {createContext, useReducer} from 'react';
import propTypes from 'prop-types';
import UserState from '../shared/models/UserState';
import UserActions from './UserActions.js';

import {GetModuleLogger} from '../utils/Logger.js';
const log = GetModuleLogger('UserContext');

//_____________________________________________________________________________
// Get the initial user state
// Check with back end to see if user has an active session ('remember me').
function getInitialState() {
  log.info(`Checking for active session`);
  const initialState = UserActions.autoLogin(UserState.defaultState);
  log.info(` .  state: ${JSON.stringify(initialState)}`);
  return initialState;
}


// Initial user state (user is not authenticated)
const initialUserState = getInitialState(); 

// note: the value passed to createContext here is 
// returned by useContext ONLY when there is NO enclosing provider
log.info(`Creating context`);
log.debug(` . initial state: ${JSON.stringify(initialUserState)}`);

const UserContext = createContext(initialUserState);

// Reducer
// Compute next state from (current state, action)
const UserContextReducer = (state, action) => {
    log.info(`UserContext: action = '${action.type}'`);
    log.debug(` .  current user state: ${JSON.stringify(state)}`)
    switch (action.type) {
      case 'autoLogin':
        const newState = UserActions.autoLogin(state); 
        log.debug(`After autoLogin: new user state: ${JSON.stringify(newState)}`);
        return newState; 
      case 'login':
        return UserActions.login(state, action.payload);
      case 'logout':
        return UserActions.logout(state);
      default:
        return state;
        //throw new Error();
    }
};

// grab the provider for the context
const { Provider } = UserContext;

// UserContextProvider: wrapper around the context provider that supplies
// the state and dispatch functions to useContext
const UserContextProvider = ( { children } ) => {
  console.log(`RENDERING USERCONTEXTPROVIDER, about to call USEREDUCER`);
  const [state, dispatch] = useReducer(UserContextReducer, initialUserState);
  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};
UserContextProvider.propTypes = {
  children: propTypes.node
};

// Export both the context and the provider.
// Context is used by components that want to use/change state; provider is used
// by components that want to serve childen the context
export { UserContext, UserContextProvider };

