import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { SignupForm }  from './SignupForm';
import PropTypes from 'prop-types';


const DialogStyles = makeStyles( theme => ({
    actionsRoot: { 
        justifyContent: 'center' 
    },
    titleRoot: { 
        justifyContent: 'center',
        display: 'flex',
        paddingBottom: '5px',
        marginBottom: '0px'
    },
    buttonRoot: {
        marginBottom: '8px'
    }
}));


export default function SignupDialog(props) {
    
   const formRef = useRef();
    
   const DialogClasses = DialogStyles();

   function onCancel() {
      props.onCancel();
   }

   function onSubmit() {
      const isValid = formRef.current.validateAll();
      if (isValid) {
         const signupRequest = formRef.current.formState;
         props.onSubmit(signupRequest, formRef);
      }
   }

   return (
        <Dialog open={props.isOpen} fullWidth maxWidth='xs'>
            <DialogTitle classes={{ root: DialogClasses.titleRoot }}>
                Sign Up 
            </DialogTitle>
            <DialogContent>
                <SignupForm ref={formRef} />
            </DialogContent>
            <DialogActions classes={{ root: DialogClasses.actionsRoot }}>
                <Button variant='contained' color='primary' size='small' onClick={onSubmit} classes={{ root: DialogClasses.buttonRoot }}> submit </Button>
                <Button variant='outlined' color='primary' size='small' onClick={onCancel} classes={{ root: DialogClasses.buttonRoot }}> cancel </Button>
            </DialogActions>
        </Dialog>
   );
}

SignupDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};
               