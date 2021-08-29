/*_________________________________________________________________________________________________
 * User
 *    User model 
 *_________________________________________________________________________________________________
 */
import * as Validation from '../Validation.js';

// Form initial state
const defaultState = {
    id: -1,
    email: '',
    firstName: '',
    lastName: '',
    created: '',
    modified: '',
    deleted: ''
};

const testState = {
    id: 777,
    email: 'steve.titus@bozo.com',
    firstName: 'steve',
    lastName: 'titus',
    created: new Date('1969/03/04').toISOString(),
    modified: '',
    deleted: ''
};
   
function validateState(state) {
    let errs = {};
    if ('id' in state)          { errs.id = Validation.ValidateString(state.id);                      }
    if ('email' in state)       { errs.email = Validation.ValidateString(state.email);                }
    if ('firstName' in state)   { errs.firstName = Validation.ValidateEmail(state.firstName);         }
    if ('lastName' in state)    { errs.lastName = Validation.ValidateString(state.lastName);          }
    if ('created' in state)     { errs.created = Validation.ValidateUTCTimestamp(state.created);      }
    if ('modified' in state && state.modified.length>0)   { errs.modified = Validation.ValidateUTCTimestamp(state.modified);    }
    if ('deleted' in state && state.deleted.length>0)     { errs.deleted = Validation.ValidateUTCTimestamp(state.deleted);      }
    return errs; 
}

function isValid(state) {
    const errs = validateState(state);
    return Object.values(errs).every( (v) => (v===''));
}

export default {
   'defaultState': defaultState,
   'validateState': validateState,
   'isValid': isValid,
   'testState': testState,
}


