/*______________________________________________________________________________
   UserContext

      Provides global user state. 
    
      Usage:
        import { UserContext, UserContextProvider } from userContext;

      Provide the context to children:
         <UserContextProvider> ... </UserContextProvider>

      Use the context in a child 
         const userContext = useContext(UserContext);
         {userState, setUserState} = userContext;
         userState = current user state (see below)
         setUserState = state setter 

      See also: shared/models/User.js
  ______________________________________________________________________________
*/
import React, {createContext, useState, useEffect, useContext} from 'react';
import { GetLoggedInUser } from '../api/apiCalls.js';
import UserModel from '../shared/models/User.js'
import { NotificationContext } from '../contexts/NotificationContext';
import propTypes from 'prop-types';

import {GetModuleLogger} from '../utils/Logger.js';
const log = GetModuleLogger('UserContext');

// Create user context with initial non-logged in state
log.info(`Creating context`);
const initialUserState = UserModel.initialState;

log.debug(`Initial state: ${JSON.stringify(initialUserState)}`);
// note: the value passed to createContext here is 
// returned by useContext ONLY when there is NO enclosing provider
const UserContext = createContext(initialUserState);

// grab the provider for the context
const { Provider } = UserContext;

// UserContextProvider: wrapper around the context provider that supplies
// the state and state setting functions to useContext
const UserContextProvider = ( { children } ) => {
  
   const notificationContext = useContext(NotificationContext);
   const {notificationState, dispatch: raiseNotification} = notificationContext;
   log.debug(`User Context NotificationContext: ${JSON.stringify(notificationState)}`);
    
    const [userState, setUserState] = useState(initialUserState);

    // First time the UserContext loads, see if the user
    // is already logged in; i.e. 'remember me'.
    useEffect(() => {
      log.debug(`One-time load: checking if user is logged in (remember me)`);
      GetLoggedInUser().then( ({user, error}) => {
         log.debug(`One-time load: user state: ${JSON.stringify(user)}`);
         setUserState(user);
         if (error) { 
            raiseNotification({type: 'error', payload: error}); 
         }
         else { 
            raiseNotification({type: 'success', payload: 'retrieved user login state'}); 
         }
      });
    },[ raiseNotification ]);

    return <Provider value={{ userState, setUserState }}>{children}</Provider>;
};

UserContextProvider.propTypes = {
  children: propTypes.node
};

// Export both the context and the provider.
// Context is used by components that want to use/change state; provider is used
// by components that want to serve childen the context
export { UserContext, UserContextProvider };