import { makeStyles } from '@material-ui/core';

// form styles
const formStyles = makeStyles( theme => ({
    root: {
        '& .MuiTextField-root': { width: '100%' }
    },
}));
 
export default function SyledForm(props) {
    const classes = formStyles();
    return (
        <form { ... (classes) && { className: classes.root} } autoComplete="off"> 
            { props.children } 
        </form>

    )
}