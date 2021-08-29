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
import React, {createContext, useState, useEffect} from 'react';
import { GetLoggedInUser } from '../api/apiCalls';
import { UserModel } from '../shared/models/User'
import propTypes from 'prop-types';
//import UserState from '../shared/models/UserState';

import {GetModuleLogger} from '../utils/Logger.js';
const log = GetModuleLogger('UserContext');

// Create user context with initial non-logged in state
log.info(`Creating context`);
const initialUserState = { loginTime: '', userID: -1, firstName: '', lastName: '' };
log.debug(` . initial state: ${JSON.stringify(initialUserState)}`);
// note: the value passed to createContext here is 
// returned by useContext ONLY when there is NO enclosing provider
const UserContext = createContext(initialUserState);

// grab the provider for the context
const { Provider } = UserContext;

// UserContextProvider: wrapper around the context provider that supplies
// the state and state setting functions to useContext
const UserContextProvider = ( { children } ) => {
    const [userState, setUserState] = useState(initialUserState);

    // First time the UserContext loads, see if the user
    // is already logged in; i.e. 'remember me'.
    useEffect(() => {
    
      const fetchData = async () => {
           const loggedInUser = await GetLoggedInUser();
           setUserState(loggedInUser);
      }

      
      log.debug(`UserContext: (first load): checking if user is logged in`);
      GetLoggedInUser().then( (apiResult) => {
        log.debug(`UserContext: calling GetLoggedInUser: complete`);
        setUserState(apiResult);
      });
    },[]);

    return <Provider value={{ userState, setUserState }}>{children}</Provider>;
};


UserContextProvider.propTypes = {
  children: propTypes.node
};

// Export both the context and the provider.
// Context is used by components that want to use/change state; provider is used
// by components that want to serve childen the context
export { UserContext, UserContextProvider };