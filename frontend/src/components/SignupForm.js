/*_____________________________________________________________________________
 * SignupForm
 *_____________________________________________________________________________
 */  
import React, {forwardRef} from 'react';
import Grid from '@material-ui/core/Grid';
import FormStateManager from '../utils/FormStateManager';
import CheckboxControl from './CheckboxControl';
import TextFieldControl from './TextFieldControl';
import StyledForm from './StyledForm';
import SignupRequest from '../shared/models/SignUpRequest.js';


export const SignupForm = forwardRef( (props, ref) => {
    
    const realtime = ('validateRealtime' in props); 
  
    //___________________________________________________________________________
    // FormStateManager creates and manages all form state and validatimn
    // It uses the forward ref to provide parent access to the form's state 
    // object and a function 'validateAll' that does all-fields validation and 
    // returns a bool on form being valid. 
    // realtime: do realtime per-field validation
    const { formState, formErrors, onFormChange } = 
        FormStateManager(
            SignupRequest.defaultState, 
            SignupRequest.validateState, 
            ref, 
            realtime
        );

    return (
        <StyledForm>
            <Grid container direction='column' spacing={2}>
                <Grid item xs={12}>
                    <TextFieldControl required name='firstName' onChange={onFormChange} 
                        label='First name' value={formState.firstName} errText={formErrors.firstName} />
                </Grid>
                <Grid item xs={12}>
                    <TextFieldControl required name='lastName' onChange={onFormChange} 
                        label='Last name' value={formState.lastName} errText={formErrors.lastName} />
                </Grid>
                <Grid item xs={12}>
                    <TextFieldControl required name='email' onChange={onFormChange} 
                        label='Email address' value={formState.email} errText={formErrors.email} />
                </Grid>
                <Grid item xs={12}>
                    <TextFieldControl required type='password' name='password' onChange={onFormChange} 
                        label='Password' value={formState.password} errText={formErrors.password} />
                </Grid>
                <Grid item xs={12}>
                    <TextFieldControl required type='password' name='passwordRepeat' onChange={onFormChange} 
                        label='Repeat password' value={formState.passwordRepeat} errText={formErrors.passwordRepeat} />
                </Grid>
                <Grid item xs={12}>
                    <CheckboxControl labelProps={{variant: 'subtitle2'}} name='rememberMe' onChange={onFormChange} 
                        label='Remember me' value={formState.rememberMe}/>
                </Grid>
            </Grid>
        </StyledForm>
    )    

});