/*_____________________________________________________________________________
 * LoginForm
 *_____________________________________________________________________________
 */  
import React, {forwardRef} from 'react';
import Grid from '@material-ui/core/Grid';
import FormStateManager from '../utils/FormStateManager';
import CheckboxControl from './CheckboxControl';
import TextFieldControl from './TextFieldControl';
import StyledForm from './StyledForm';
import LoginRequest from '../shared/models/LoginRequest.js'; 

export const LoginForm = forwardRef( (props, ref) => {
    
    const realtime = ('validateRealtime' in props); 
    
    const { formState, formErrors, onFormChange } = 
        FormStateManager(LoginRequest.defaultState, LoginRequest.validateState, ref, realtime);

    return (
        <StyledForm>
            <Grid container direction='column' spacing={2}>
                <Grid item xs={12}>
                    <TextFieldControl required name='email' onChange={onFormChange} 
                        label='Email address' value={formState.email} errText={formErrors.email} />
                </Grid>
                <Grid item xs={12}>
                    <TextFieldControl required type='password' name='password' onChange={onFormChange} 
                        label='Password' value={formState.password} errText={formErrors.password} />
                </Grid>
                <Grid item xs={12}>
                    <CheckboxControl labelProps={{variant: 'subtitle2'}} name='rememberMe' onChange={onFormChange} 
                        label='Remember me' value={formState.rememberMe}/>
                </Grid>
            </Grid>
        </StyledForm>
    )    

});