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

import {GetModuleLogger} from '../util/Logger.js';
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
 *          '404':
 *              $ref: '#/components/responses/NotFound'
 */ 
async function getLoggedInUser(req, res, next) {
    try {
        log.debug(`getLoggedInUser: checking for user session`);
        if ('user_id' in req.session) {
            log.debug(`getCurrentUser: active session with user_id ${req.session.user_id}`);
            res.sendStatus(200);
        }
        else {
            log.debug(`getLoggedInUser: no 'user_id' in session (not logged in)`);
            res.status(404).json({
                "message": "not logged in" 
            });
        }
    }
    catch (err) {
      next(err)
    }
}
router.get('/user', getLoggedInUser); 




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
 */ 



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