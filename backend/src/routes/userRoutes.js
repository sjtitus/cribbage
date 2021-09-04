/*_________________________________________________________________________________________________
 * Cribbage user routes
 *_________________________________________________________________________________________________
*/


/*
If a user is attempting to authenticate, but provides invalid credentials, the response should have a status of 401, regardless of if you 
are using Basic Authorization or not. 401 indicates that authentication failed, but the user can alter their request and attempt again.

If a user is authenticated, but not authorized to access the requested resource, then the response should have a status of 403. 
403 indicates that the user is forbidden from accessing the resource, and no matter how they alter the request, they will not be 
permitted access.

In the scenario that your endpoint requires the credentials to be in the body of the request, you should return a 400 if the 
request body does not meet your specifications.
            

//log.warn(`logoutUser: clearing session cookie`); 
            //res.clearCookie('cribbage', {path: "/"});
            //log.warn(`logoutUser: destroying session`); 
            //req.session.destroy();

*/

import express from 'express';
import { User } from '../models/User.js'; 
import { DeleteSession } from './Helpers.js'; 
import { GetModuleLogger } from '../util/Logger.js';
const log = GetModuleLogger('UserRoutes');

const router = express.Router();


/**
 * @openapi
 *
 *  /user:
 *  get:
 *      tags:
 *          - user
 *      description: Returns currently logged in user 
 *      responses:
 *          '200':
 *              $ref: '#/components/responses/User'
 *          '202':
 *              $ref: '#/components/responses/NotLoggedIn'
 *          '410':
 *              $ref: '#/components/responses/Gone'
 */ 
async function GetLoggedInUser(req, res, next) {
   try {
      log.debug(`GetLoggedInUser: checking for user session`);
      let user = new User();
      if ('user_id' in req.session) {
         const uid = req.session.user_id;
         log.debug(`GetLoggedInUser: active session with user_id ${uid}`);
         const userFound = await user.Load(uid);
         if (userFound) {
            res.status(200).json(user.UserObject);
         }
         else {
            log.error(`GetLoggedInUser: existing session user ${uid} gone from database, clearing session/cookie`);
            DeleteSession(req, res, log);
            res.status(410).json({ "message": "user no longer exists" });
         }
      }
         else {
            log.debug(`GetLoggedInUser: no 'user_id' in session (not logged in)`);
            res.status(202).json({ "message": "user not logged in" });
         }
    }
    catch (err) {
      next(err)
    }
}
router.get('/user', GetLoggedInUser); 

/**
 * @openapi
 *
 *  /users:
 *  post:
 *      tags:
 *          - user
 *      description: Creates a new user
 *      requestBody: 
 *          $ref: '#/components/requestBodies/NewUserReqBody'
 *      responses:
 *          '201': 
 *              $ref: '#/components/responses/NewUserCreated'
 *          '400': 
 *              $ref: '#/components/responses/BadRequest'
 *          '410':
 *              $ref: '#/components/responses/Gone'
 */ 
async function CreateNewUser(req, res, next) {
    try {
        log.debug(`CreateNewUser: checking for user session`);
        if ('user_id' in req.session) {
            const uid = req.session.user_id;
            log.debug(`CreateNewUser: active session with user_id ${uid}`);
            let user = new User();
            const userFound = await user.Load(uid);
            if (userFound) {
               // user already logged in 
               log.error(`CreateNewUser: create new user should not be allowed when session exists (uid=${uid})`);
               res.status(400).json({ message: "user already logged in"});
            }
            else {
               // session, but no user in db 
               log.error(`CreateNewUser: existing session user ${uid} gone from database, clearing session/cookie`);
               DeleteSession(req, res, log);
               res.status(410).json({ "message": "user no longer exists" });
            }
        }
        else {
            // happy path: no session, create the user as long as it's not a duplicate 
            res.status(201).json({ happy: "birthday" }); 
        }
    }
    catch (err) {
      next(err)
    }
}
router.post('/users', CreateNewUser); 




/**
 * @openapi
 *
 *  /users:
 *  get:
 *      tags:
 *          - user
 *      description: Returns all users 
 *      responses:
 *          '200':
 *              $ref: '#/components/responses/UserList'
 *          '401':
 *              $ref: '#/components/responses/Unauthorized'
 */ 
async function getUsers(req, res, next) {
    try {
        res.status(200).json({"message" : "get /users route"});
//        const log = req.app.get('logger');
//        log.debug(`logoutUser`);
//        if ('user_id' in req.session) {
//            log.warn(`logoutUser: logout user ${req.session.user_id}`);
//            log.warn(`logoutUser: clearing session cookie`); 
//            res.clearCookie('cribbage', {path: "/"});
//            log.warn(`logoutUser: destroying session`); 
//            req.session.destroy();
//        }
//        else {
//            log.debug(`logoutUser: not logged in`); 
//        }
//        res.sendStatus(200);
    }
    catch (err) {
      next(err)
    }
}
router.get('/users', getUsers); 





async function delayTest(req, res, next) {
    try {
        const delayMillisec = req.query.delayMillis || 5000;
        log.debug(`delayTest: waiting for ${delayMillisec} ms before returning`);
        await new Promise( (resolve) => setTimeout(resolve, delayMillisec) );
        res.setHeader('Access-Control-Allow-Origin','http://localhost:3000');
        res.setHeader('Vary','Origin');
        res.status(200).json({"message" : "delayTest successful"});
    }
    catch (err) {
      log.error(`delayTest: error waiting for ${delayMillisec} ms before returning: ${err.message}`);
      next(err)
    }
}
router.get('/delayTest', delayTest); 







/**
 * @openapi
 * 
 *  /users/{userId}:
 *  get:
 *      tags:
 *          - user
 *      description: Return a specific user 
 *      parameters:
 *          - $ref: '#/components/parameters/userIdParam'
 *      responses:
 *          '200':
 *              $ref: '#/components/responses/User'
 *          '401':
 *              $ref: '#/components/responses/Unauthorized'
 * 
 */


export default router;