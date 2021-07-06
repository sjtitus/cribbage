import LandingPage from './components/LandingPage';
import GamePage from './components/GamePage';
import { UserContextProvider }  from './contexts/UserContext';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;
