import React from 'react';
import Button from '@material-ui/core/Button';

export default function ButtonControl(props) {

    const {text, size, color, variant, onClick, ...other} = props;
    
    return (
        <Button
            variant = {variant}
            size = {size} 
            color = {color}
            onClick = {onClick}
            {...other}
        >
            { text }
        </Button>
    )
}
