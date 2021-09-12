/*______________________________________________________________________________
  NotificationContext

   Provides global notification state. 
    
   Usage:
      import { NotificationContext, NotificationContextProvider } from NotificationContext;

   Provide the context to children:
      <NotificationContextProvider> ... </NotificationContextProvider>

   Use the context in a child 
      const notificationContext = useContext(NotificationContext);
      {notificationState, dispatch} = notificationContext;
      notificationState = current notification state
      dispatch = dispatcher for state change 
   
   Notification State
      Latest alert and a time-ordered (newest first) of previous 10 alerts
      {
         latest: {timestamp, severity, message },
         previous: [ {timestamp, severity, message }, ... ]
      }

   Dispatch Actions:
        notificationContext.dispatch( {type: 'error' | 'warning' | 'info' | 'success', message: <text> } );

  ______________________________________________________________________________
*/
import { strict as assert } from 'assert';
import React, {createContext, useReducer } from 'react';
import propTypes from 'prop-types';

import {GetModuleLogger} from '../utils/Logger.js';
const log = GetModuleLogger('NotificationContext');

const maxNotifications = 10;
const sevList = ['error', 'warning', 'info', 'success'];

// Initial state 
const initialState = {latest: { severity: null, message: null}, previous: []}; 
log.debug(`Create context with initial state: ${JSON.stringify(initialState)}`);

// note: the value passed to createContext here is 
// returned by useContext ONLY when there is NO enclosing provider
const NotificationContext = createContext(initialState);

// grab the provider for the context
const { Provider } = NotificationContext;

function calcNewState(state, newNotification) {
   let newPrevious = [];
   // not the first: create new previous list
   if (state.latest.severity !== null) {
      if (state.previous.length === maxNotifications) {
         state.previous.pop();
      } 
      for (let i=0; i<state.previous.length; i++) {
         newPrevious.push({...state.previous[i]});
      }
      newPrevious.unshift({...state.latest});
   }
   const newState = {
      latest: newNotification,
      previous: newPrevious
   };
   log.debug(`Total previous notifications: ${newState.previous.length}`);
   return newState;
}

// Reducer: takes the current state action and returns the next state
function notificationReducer(state, action) {
   const {type:severity, payload:message} = action;
   assert(sevList.includes(severity) && message);
   log.debug(`Raising notification: [${severity}]: ${message}`);
   const ts = Date.now();
   const timeString = new Date(ts).toLocaleString();
   const newNotification = { timestamp: ts, severity: severity, message: `${timeString}: ${message}` };
   const newState = calcNewState(state, newNotification);
   return newState; 
 }
 

// NotificationContextProvider: wrapper around the context provider that supplies
// the state and dispatch functions to useContext
const NotificationContextProvider = ( { children } ) => {
    
    const [notificationState, dispatch] = useReducer(notificationReducer, initialState);  

    /*
    // First time the NotificationContext loads, see if the notification
    // is already logged in; i.e. 'remember me'.
    useEffect(() => {
      log.debug(`Application load: checking if notification is logged in (remember me)`);
      GetLoggedInNotification().then( (notification) => {
         log.debug(`Application load: notification state: ${JSON.stringify(notification)}`);
         setNotificationState(notification);
      });
    },[]);
    */

    return <Provider value={{ notificationState, dispatch }}>{children}</Provider>;
};

NotificationContextProvider.propTypes = {
  children: propTypes.node
};

// Export both the context and the provider.
// Context is used by components that want to use/change state; provider is used
// by components that want to serve childen the context
export { NotificationContext, NotificationContextProvider };