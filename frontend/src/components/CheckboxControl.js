import React from 'react';
import FormControl from '@material-ui/core/FormControl';
//import {makeStyles} from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';

export default function CheckboxControl(props) {

    const {name, label, value, onChange, labelProps} = props;
   
    const convertToStandardEvent = (name, value) => ( {
        target: { name, value }
    })

    return (
        <FormControl>
            <FormControlLabel
                control={
                    <Checkbox
                        name = {name}
                        size = 'small'
                        color = 'primary'
                        checked = {value}
                        onChange = {e => onChange(convertToStandardEvent(name, e.target.checked))} 
                    />
                }    
                label={<Typography {...labelProps}>{label}</Typography>}
            />
        </FormControl>
    )
}
