
import React, {useContext} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import HomeIcon from '@material-ui/icons/Home';
import Button from '@material-ui/core/Button';
import UserMenu from './UserMenu';
import { UserContext } from '../contexts/UserContext';
import { withStyles } from '@material-ui/core/styles';
 
const styles = (theme) => ({
  menuButton: { marginRight: theme.spacing(2), },
  pushRight: { flexGrow: 1 },
  appBarText: {  marginRight: theme.spacing(4), },
  appToolbar: {  minHeight: 30 },
  appBar: { position: 'static', marginBottom: '20px'}
});


function Opt1Callback(arg) {
  console.log(`opt1`)
}
function Opt2Callback(arg) {
  console.log(`opt2`)
}
function Opt3Callback(arg) {
  console.log(`opt3`)
}

const userMenuOptions = [
  { label: "opt1", callback: Opt1Callback},
  { label: "opt2", callback: Opt2Callback},
  { label: "opt3", callback: Opt3Callback}
];


function MyAppBar(props) {
  
  const {
      classes,
      onLoginClick,
      ...other
  } = props; 

  const userContext = useContext(UserContext);
  const { state } = userContext;
  const loggedIn = (state.userID > 0);

  const LoginButton = (!loggedIn) ?
          <Button onClick={()=>{onLoginClick()}} variant="contained" color="primary"> Login </Button>:null;

  return (
    <div className={classes.root}>
      <AppBar className={classes.appBar}>
        <Toolbar className={classes.appToolbar}>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" className={classes.pushRight}></Typography>
          { LoginButton } 
          <UserMenu options={ userMenuOptions }/>
        </Toolbar>
      </AppBar>
    </div>
  );
}
          //<Typography variant="h6" className={classes.appBarText}> Login </Typography>

export default withStyles(styles, { name: 'stAppBar' })(MyAppBar);


