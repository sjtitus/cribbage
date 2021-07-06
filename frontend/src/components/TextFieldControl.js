import React from 'react';
import TextField from '@material-ui/core/TextField';

export default function TextFieldControl(props) {

    const {name, label, value, onChange, errText, ...other} = props;
    
    return (
        <TextField 
            size = 'small' 
            variant = 'outlined' 
            name = {name} 
            onChange = {onChange} 
            label = {label} 
            value = {value}
            { ... (errText) && { error: true, helperText: errText } }
            { ... other } 
        />
    )
}