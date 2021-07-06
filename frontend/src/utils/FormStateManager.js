import {useState, useImperativeHandle} from 'react';

// Manage form state changes via a state object
export default function FormStateManager(initFormState, formValidate, ref, realtimeValidation) {

    const [formState, setFormState] = useState(initFormState);
    const [formErrors, setFormErrors] = useState({});
    
    // expose validation and state to parent 
    useImperativeHandle(ref, () => ({
        validateAll: validateAll,
        formState: formState
    }));
   
    // update form state as inputs change
    const onFormChange = (e) => {
        const {name, value} = e.target;
        let errs = (realtimeValidation) ? formValidate({ [name]: value }):null;
        setFormState({
            ...formState,
            [name]: value
        });
        errs && setFormErrors( { ...errs} );
    };

    // validate all form fields and set error strings accordingly
    const validateAll = () => {
        const errs = formValidate(formState);
        setFormErrors( {...errs} );
        return Object.values(errs).every((msg)=>(msg===''));
    }

    return { formState, setFormState, formErrors, validateAll, onFormChange };
}

