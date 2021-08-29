/*_________________________________________________________________________________________________
*  User 
*  Backend business-layer User model
*  Reads and writes JS object model to/from the database 
*__________________________________________________________________________________________________
 */
import { strict as assert } from 'assert';
import DbUser from '../database/DbUser.js'; 
import JSUser from '../shared/models/User.js';

import {GetModuleLogger} from '../util/Logger.js';
const log = GetModuleLogger('User');

export class User {
   
   constructor() {
      this._user = { ...JSUser.initialState }; 
      log.debug(`Constructor: new uninitialized user ${JSON.stringify(this._user)}`);
   }

   async Load(userId) {
      assert(this._user.id === -1, `Load: user must be uninitialized`);
      log.debug(`Load: id=${userId}`);
      const dbUser = await DbUser.read({id: userId});
      // not found in db 
      if (!dbUser) {
         return false; 
      }
      this._dbUser = dbUser;
      this._convert();
      if (!JSUser.isValid(this._user)) {
         const errs = JSUser.validateState(this._user);
         log.error(`Load: id=${userId}: invalid db object (fields invalid/missing): ${JSON.stringify(errs)}`);
         throw new Error(`User::Load: id=${userId}: invalid db object (fields invalid/missing)`);
      }
      return true; 
   }

   async Save() {
   }

   // Convert the DB user to a JS user 
   _convert() {
      this._user.id = this._dbUser["id"];
      this._user.email = this._dbUser["email"];
      this._user.firstName = this._dbUser["firstname"];
      this._user.lastName = this._dbUser["lastname"];
      this._user.created = this._dbUser["timestampcreated"];
      this._user.modified = this._dbUser["timestampmodified"];
      this._user.deleted = this._dbUser["timestampdeleted"]
   }
}
