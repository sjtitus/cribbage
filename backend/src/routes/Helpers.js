import { strict as assert } from 'assert';

export function DeleteSession(req, res, log) {
   assert( req && res && req.session && res.locals.sessionManager );
   const cookieName = res.locals.sessionManager.sessionConfig.name;
   const cookiePath = res.locals.sessionManager.sessionConfig.path;
   log.debug(`deleting session id=${req.session.id} and clearing cookie ${cookieName} (path ${cookiePath})`);
   res.clearCookie(cookieName, { path: cookiePath });
   req.session.destroy();
}