/*_____________________________________________________________________________
 * AlertBar 
*_____________________________________________________________________________
 */
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& > * + *': { marginTop: theme.spacing(2) },
  },
})); 


export default function AlertBar(props) {
  
  const classes = useStyles();
  
  const [details, setDetails] = React.useState({open: false, severity:'error', message: ''});

  // change state and show only if the alert information has CHANGED
  if ((props.message && props.message !== details.message) || 
      (props.severity && props.severity !== details.severity)) {
        setDetails({
            open: true, 
            severity: props.severity || details.severity, 
            message: props.message || details.message
        });
  }

  return (
    <div className={classes.root}>
      <Collapse in={details.open}>
        <Alert
          severity={details.severity}
          action={
            <IconButton aria-label="close" color="inherit" size="small"
              onClick={() => setDetails({...details, open: false})} >
                <CloseIcon fontSize="inherit" />
            </IconButton>
          }>
            { details.message } 
        </Alert>
      </Collapse>
    </div>
  );

}

AlertBar.propTypes = {
  message: PropTypes.string,
  severity: PropTypes.string,
};