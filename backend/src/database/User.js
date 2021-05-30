/*_________________________________________________________________________________________________
*  UserEntity
*  Database entity for user 
*_________________________________________________________________________________________________
 */
import { strict as assert } from 'assert';
import Database from './database/Database.js';
import Logger from '../util/Logger.js';

// Logging
const log = Logger.child({module:'UserEntity'});

// Database singleton 
const db = Database.Instance('UserEntity');
assert(db, "Database instance must exist");

// SQL for database user operations 
const sql = {
    createUser: 'SELECT * from createUser($1,$2,$3,$4,$5,$6)',  // email, first, last, salt, encryptedPW, iters
    getUserByEmail: 'SELECT * FROM usr WHERE email = $1 and isDeleted=false',
    updateUser: 'UPDATE usr SET email=$1, firstName=$2, lastName=$3, timestampModified=current_timestamp WHERE id=$4 and isDeleted=false RETURNING *',
    deleteUser: 'UPDATE usr SET isDeleted=true WHERE id=$1 RETURNING *'
    //getUserById: 'SELECT * FROM usr WHERE id = $1',
    //deleteUserByEmail: 'DELETE FROM usr WHERE email = $1',
    //deleteUserById: 'DELETE FROM usr WHERE id = $1',
    //getPasswordByUserId: 'SELECT * FROM passwd WHERE id_usr = $1',
}

async function userCreate( email, firstName, lastName, salt, encryptedPassword, cryptIters ) {
    log.debug(`userCreate: email='${email}', firstName=${firstName}, lastName=${lastName}`);
    const { rows:users } = await db.Query( sql.createUser, [email, firstName, lastName, salt, encryptedPassword, cryptIters] );
    if (users.length !== 1) {
        log.error(`userCreate: failed to create user for email '${email}'`);
        throw new Error(`User create for email ${email}: unexpected number of records updated: ${users.length}`);
    }
    const newUser = users[0];
    return newUser; 
}

async function userFind(email) {
    log.debug(`userFind: email='${email}'`);
    const { rows:users } = await db.Query( sql.getUserByEmail, [email] );
    if (users.length === 0) {
        log.debug(`userFind: user for email '${email}' not found`);
        return null;
    }
    log.debug(`userFind: found ${users.length} users`);
    assert(users.length === 1);
    const newUser = users[0];
    return newUser; 
}

async function userUpdate(email, firstName, lastName, id) {
    log.debug(`userUpdate: email='${email}', firstName=${firstName}, lastName=${lastName}`);
    const {rows: users} = await db.Query( sql.updateUser, [email, firstName, lastName, id ]);
    if (users.length !== 1) {
        log.error(`userUpdate: failed to update user for email '${email}' (empty result)`);
        throw new Error(`User update for email ${email}: unexpected number of records updated: ${users.length}`);
    }
    const updatedUser = users[0];
    return updatedUser;
}

async function userDelete(id) {
    log.debug(`userDelete: id='${id}'`);
    const {rows: users} = await db.Query( sql.deleteUser, [id]);
    if (users.length !== 1) {
        log.error(`userUpdate: failed to delete user for id '${id}' (empty result)`);
        throw new Error(`User delete for id ${id}: unexpected number of records updated: ${users.length}`);
    }
    const updatedUser = users[0];
    return updatedUser;
}

const UserEntity = {
    create: userCreate,
    read: userFind,
    update: userUpdate,
    delete: userDelete
};

export default UserEntity;


 /*
    // query database 
    if (id !== undefined) {
        log.debug(`Read: fetching user with id=${id}`);
        queryString = sql.getUserById;
        dbResult = db.Query(queryString, [id]);
    }
    else if (email !== undefined) {
        log.debug(`Read: fetching user with email=${email}`);
        queryString = sql.getUserByEmail;
        dbResult = await db.Query(queryString, [email]);
    }
    // throw on error 
    if (!(dbResult) || !('rowCount' in dbResult)) {
        err = `Read: database result null or missing rowCount (query: '${queryString})`;
    }
    if (dbResult.rowCount > 1) { 
        err = `Read: query returned multiple (${dbResult.rowCount}) results (query: '${queryString})`;
    }
    if (err) {
        log.error(err);
        throw new Error(err);
    }
        // Initialize and return the object 
    }
    
    // Load 
    // Load existing user object from existing persistent user record.
    // User record must exist.  
    Load() {
    }


    // Delete
    // Delete the underlying user object. User record must exist.  
    Delete() {
    }

}



// Database interface 


// Read single user from database 
async function Read({email, id}) {
    assert((email !== undefined) || (id !== undefined));
    let dbResult = null;
    let queryString;
    let err = null;
    // query database 
    if (id !== undefined) {
        log.debug(`Read: fetching user with id=${id}`);
        queryString = sql.getUserById;
        dbResult = db.Query(queryString, [id]);
    }
    else if (email !== undefined) {
        log.debug(`Read: fetching user with email=${email}`);
        queryString = sql.getUserByEmail;
        dbResult = await db.Query(queryString, [email]);
    }
    // throw on error 
    if (!(dbResult) || !('rowCount' in dbResult)) {
        err = `Read: database result null or missing rowCount (query: '${queryString})`;
    }
    if (dbResult.rowCount > 1) { 
        err = `Read: query returned multiple (${dbResult.rowCount}) results (query: '${queryString})`;
    }
    if (err) {
        log.error(err);
        throw new Error(err);
    }
    // no result found 
    if (dbResult.rowCount === 0) {
        log.debug(`Read: user not found`);
        return null;
    }
    else {
        // success! 
        log.debug(`Read: found user: ${JSON.stringify(dbResult.rows[0])}`);
        return dbResult.rows[0];
    }
}


async function Update() {
}

async function Delete() {
}


const defaultState = {
    id: -1,
    email: '',
    firstName: '',
    lastName: '',
    created: '',
    modified: '',
    deleted: '',
    isDeleted: false
};

const testState = {
    id: 777,
    email: 'steve.titus@bozo.com',
    firstName: 'steve',
    lastName: 'titus',
    created: new Date('1969/03/04').toISOString(),
    modified: '',
    deleted: '',
    isDeleted: false
};
    

    // Validate user state
    // Return error object with validation error strings (empty if successful)
    static ValidateState(state) {
        let errs = {};
        if ('id' in state)                                      { errs.id = Validation.ValidateString(state.id);                   }
        if ('email' in state)                                   { errs.email = Validation.ValidateEmail(state.email);              }
        if ('firstName' in state)                               { errs.firstName = Validation.ValidateEmail(state.firstName);      }
        if ('lastName' in state)                                { errs.lastName = Validation.ValidateString(state.lastName);       }
        if ('created' in state)                                 { errs.created = Validation.ValidateUTCTimestamp(state.created);   }
        if ('modified' in state && state.modified.length>0)     { errs.modified = Validation.ValidateUTCTimestamp(state.modified); }
        if ('deleted' in state && state.deleted.length>0)       { errs.deleted = Validation.ValidateUTCTimestamp(state.deleted);   }
        if ('isDeleted' in state)                               { errs.isDeleted = Validation.ValidateBoolean(state.isDeleted);    }
        return errs; 
    }

    // Is user state valid
    // Returns true/false
    static IsValid(state) { 
        const errs = validateState(state);
        return Object.values(errs).every((v) => (v===''));
    }

*/