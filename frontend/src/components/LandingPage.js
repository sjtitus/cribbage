/*_____________________________________________________________________________
 * LandingPage 
 * Cribbage application landing page (for an unauthenticated user)
*_____________________________________________________________________________
 */
import React, {useState, useContext} from 'react';
import MyAppBar from './MyAppBar';
import JoinGame from './JoinGame';
import AlertBar from './AlertBar';
import Typography from '@material-ui/core/Typography';
import cribbageHandImage from './cribbagehand.png';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import SignupDialog from './SignupDialog';
import LoginDialog from './LoginDialog';
import { UserContext } from '../contexts/UserContext';
import { NotificationContext } from '../contexts/NotificationContext';
import { Login, Signup } from '../api/apiCalls.js';
import { Link } from 'react-router-dom';

import {GetModuleLogger} from '../utils/Logger.js';
const log = GetModuleLogger('LandingPage');

function LandingPage(props) {
 
   // State: signup/login dialogs open/closed
   const [signUpOpen, setSignUpOpen] = useState(false);
   const [loginOpen, setLoginOpen] = useState(false);
 
   // UserContext: page will have access to user info
   const userContext = useContext(UserContext);
   const { userState, setUserState } = userContext;
   //log.debug(`Loaded UserContext: ${JSON.stringify(userState)}`);

   // NotificationContext: page will raise notifications 
   const notificationContext = useContext(NotificationContext);
   const {notificationState, dispatch: raiseNotification} = notificationContext;
   //log.debug(`Landing Page NotificationContext: ${JSON.stringify(notificationState)}`);


   //__________________________________________________________________________
   // Join Game 
   const codeValidationFunc = (code) => {
      log.info(`validating code ${code}`);
      return (code.length > 6);
   }
  
   const JoinGameFunc = (code) => {
      log.info(`joining game: ${code}`);
   }

   //__________________________________________________________________________
   // Signup 
   const signupHandler = async (signupRequest) => {
      try {
         log.debug(`Making async signup request: ${JSON.stringify(signupRequest)}`);
         const { user, error } = await Signup(signupRequest);
         log.debug(`Signup user result: ${JSON.stringify(user)}`);
         setUserState(user);
         if (error) { 
            raiseNotification({type: 'error', payload: `user signup failed: ${error}`}); 
         }
         else { 
            raiseNotification({type: 'success', payload: `user signup successful: ${user.firstName} ${user.lastName} (id=${user.id})`}); 
         }
      }
      catch (err) {
         log.error(`Error handling signup request: ${err.message}`);
         raiseNotification({type: 'error', payload: err.message}); 
      }
   };

   const OnSignupSubmit = (signupRequest, formRef) => {
      //const isValid = formRef.current.validateAll();
      // const signUpInfo = formRef.current.formState;
      signupHandler(signupRequest); 
      setSignUpOpen(false);
   }
  
   const OnSignupCancel = (arg) => {
      setSignUpOpen(false);
   }


   //__________________________________________________________________________
   // Handle Login
   const loginHandler = async (loginRequest) => {
      try {
         log.debug(`Making async login request: ${JSON.stringify(loginRequest)}`);
         const { user, error } = await Login(loginRequest);
         log.debug(`Login user result: ${JSON.stringify(user)}`);
         setUserState(user);
         if (error) { 
            raiseNotification({type: 'error', payload: error}); 
         }
         else { 
            raiseNotification({type: 'success', payload: 'user login successful'}); 
         }
      }
      catch (err) {
         log.error(`Error handling login request: ${err.message}`);
         raiseNotification({type: 'error', payload: err.message}); 
      }
   };

   const OnLoginSubmit = (loginRequest, formRef) => {
      loginHandler(loginRequest); 
      setLoginOpen(false);
   }
  
   const OnLoginCancel = (arg) => {
      setLoginOpen(false);
   }
   
   const loggedIn = false;


   //__________________________________________________________________________
   // Start a new game 
   const onStartNewGame = (arg) => {
      log.info(`Starting a new game...`);
   }
 

   const verticalGridProps = {
      container: true, 
      direction: 'column',
      alignContent: 'center',
      spacing: 4
   }

   const SignUpComponent = (!loggedIn) ?
        (<Grid item>
            <Grid container direction="column" alignContent="center">
              <Grid item> 
                <Typography variant= "h6" align="center"> Sign up to start a new game</Typography>
              </Grid>
              <Grid item align="center">
                <Button onClick={()=>{setSignUpOpen(true)}} variant="contained" color="primary"> Sign Up </Button>
              </Grid>
            </Grid>
        </Grid>):
        (<Grid item>
            <Grid container direction="column" alignContent="center">
              <Grid item> 
                <Typography variant= "h6" align="center"> Welcome back, "Your Name Here"! </Typography>
              </Grid>
              <Grid item align="center">
                <Button onClick={()=>{onStartNewGame()}} variant="contained" color="primary"> New Game </Button>
              </Grid>
            </Grid>
        </Grid>);

   return (
      <div>
         <SignupDialog isOpen={signUpOpen} onCancel={OnSignupCancel} onSubmit={OnSignupSubmit}/>
         <LoginDialog isOpen={loginOpen} onCancel={OnLoginCancel} onSubmit={OnLoginSubmit}/>
         
         <Link to="/game"> Game Page </Link>
         
         <MyAppBar onLoginClick={() => setLoginOpen(true)}/>
         <AlertBar severity={notificationState.latest.severity} message={notificationState.latest.message} />

         <Grid { ...verticalGridProps}> 
         <Grid item>
               <Typography variant= "h4" align="center"> Let's Play Cribbage </Typography>
         </Grid>
         <Grid item>
               <img src={cribbageHandImage} alt="cribbage hand"></img>
         </Grid>
         { SignUpComponent } 
         <Grid item>
               <JoinGame onChange={codeValidationFunc} onJoin={JoinGameFunc}/> 
         </Grid>
         </Grid>
      </div>
   );
}

export default LandingPage; 


/*
      <Button
        variant="outlined"
        onClick={() => { dispatch({type: 'error', payload: 'this is an error message'}) }}
      >
        one
      </Button>
      <Button
        variant="outlined"
        onClick={() => { dispatch({type: 'success', payload: 'this is a success message'}) }}
      >
        two
      </Button>

      <Button onClick={()=>{setSignUpOpen(true)}} variant="contained" color="primary"> Sign Up </Button>
*/