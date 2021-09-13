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
import SignupRequest from '../shared/models/SignUpRequest.js';
import Config from '../../config/Config.js';
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
async function Signup(req, res, next) {
   try {
      log.debug(`Signup: checking for user session`);
      let user = new User();
      if ('user_id' in req.session) {
         const uid = req.session.user_id;
         log.debug(`Signup: active session with user_id ${uid}`);
         const userFound = await user.Load(uid);
         if (userFound) {
            // user already logged in 
            log.error(`Signup: create new user should not be allowed when session exists (uid=${uid})`);
            res.status(400).json({ message: "user already logged in" });
         }
         else {
            // session, but no user in db (should NOT happen) 
            log.error(`Signup: existing session user ${uid} gone from database, clearing session/cookie`);
            DeleteSession(req, res, log);
            res.status(410).json({ "message": "user no longer exists" });
         }
      }
      else {
         log.debug(`Signup: no user session found, validating request`);
         // validate the signup request
         const { error, message } = SignupRequest.validateRequest(req);
         if (error) {
            log.debug(`Signup: bad request: ${message}`);
            res.status(400).json({ message: message });
         }
         else {
            // request is good
            const {firstName, lastName, email, password, passwordRepeat, rememberMe } = req.body;
            log.debug(`Signup: create new user: email=${req.body.email}, firstName=${firstName}, lastName=${lastName}`);
            await user.Create(email, firstName, lastName, password);
            // if we got here, user creation was successful
            const userObject = user.UserObject;
            log.debug(`Signup: new user created: email=${userObject.email}, id=${userObject.id}`);
            // if rememberme is set, drop a cookie
            if (rememberMe) {
               const sessionDays = Config.server.session.maxAgeDays;
               log.debug(`Signup: establishing session/cookie for user ${userObject.email}`);
               req.session.user_id = userObject.id; 
               req.session.cookie.maxAge = sessionDays * 24 * 60 * 60 * 1000;
            } 
            res.status(201).json(userObject);
         }
      }
   }
   catch (err) { 
      next(err)
   }
}
router.post('/users', Signup); 




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