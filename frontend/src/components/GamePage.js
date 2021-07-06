/*_____________________________________________________________________________
  GamePage
  Game Page 
  _____________________________________________________________________________
*/
import React, {useContext} from 'react';
import { Redirect } from "react-router-dom";
import { UserContext } from '../contexts/UserContext';

import Logger from '../utils/Logger';
const log = Logger.child({module:'GamePage'});
    

export default function GamePage() {
  
  const userContext = useContext(UserContext);
  const {state, dispatch} = userContext;
  
  log.info(`Rendering gamepage: user id = ${state.userID}`);
  
  return (
    <div>
      <h1> ==== GAME PAGE === </h1>
    </div>
  );
}