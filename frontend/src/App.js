import LandingPage from './components/LandingPage';
import GamePage from './components/GamePage';
import { UserContextProvider }  from './contexts/UserContext';
import { NotificationContextProvider }  from './contexts/NotificationContext';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
//import { AxiosTest } from './components/AxiosTest';
                    // <LandingPage/>

function App() {
  
  return (
    <Router>
          <NotificationContextProvider>
          <UserContextProvider>
          <div>
            <Switch>
                <Route exact path="/">
                     <LandingPage/>
                </Route>
                <Route exact path="/game">
                    <GamePage/>
                </Route>
            </Switch>
          </div>
          </UserContextProvider>
          </NotificationContextProvider>
    </Router>
  );
}

export default App;
