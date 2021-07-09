import LandingPage from './components/LandingPage';
import GamePage from './components/GamePage';
import { UserContextProvider }  from './contexts/UserContext';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AxiosTest } from './components/AxiosTest';
                    // <LandingPage/>

function App() {
  
  return (
    <Router>
          <UserContextProvider>
          <div>
            <Switch>
                <Route exact path="/">
                     <AxiosTest/>
                </Route>
                <Route exact path="/game">
                    <GamePage/>
                </Route>
            </Switch>
          </div>
          </UserContextProvider>
    </Router>
  );
}

export default App;
