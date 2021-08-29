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
      this._dbUser = null; 
      log.debug(`Constructor: new uninitialized user ${JSON.stringify(this._user)}`);
   }

   get UserObject() { return this._user; }
   get DBObject() { return this._dbuser; }

   async Load(userId) {
      assert(this._user.id === -1, `Load: user must be uninitialized`);
      log.debug(`Load: id=${userId}`);
      const dbUser = await DbUser.read({id: userId});
      this._dbUser = dbUser;
      this._convert();
      return (dbUser !== null);
   }

   async Save() {
   }

   // Convert the DB user to a JS user 
   _convert() {
      if (this._dbUser === null) {
         log.warning(`User model: db object is null id=${this._user.id}: reinitializing model`);
         this._user = { ...JSUser.initialState };
         return false;
      }
      this._user.id = this._dbUser["id"];
      this._user.email = this._dbUser["email"];
      this._user.firstName = this._dbUser["firstname"];
      this._user.lastName = this._dbUser["lastname"];
      this._user.created = this._dbUser["timestampcreated"];
      this._user.modified = this._dbUser["timestampmodified"];
      this._user.deleted = this._dbUser["timestampdeleted"]
      if (!JSUser.isValid(this._user)) {
         const errs = JSUser.validateState(this._user);
         log.error(`User model: id=${this._user.id}: db object (fields invalid/missing): ${JSON.stringify(errs)}`);
         throw new Error(`User model: id=${this._user.id}: invalid db object (fields invalid/missing)`);
      }
   }
}
