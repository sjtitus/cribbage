/*_____________________________________________________________________________
 * Cribbage: backend server
 *_____________________________________________________________________________
*/
import { strict as assert } from 'assert';
import httpContext from 'express-http-context';
import express from 'express';
import expressWinston from 'express-winston';
import { v4 as uuidv4 } from 'uuid';
import Logger from '../util/Logger.js';
import Config from '../../config/Config.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import CribbageSessionManager from './CribbageSessionManager.js';
import userRoutes from '../routes/userRoutes.js';

/*
import apiRoutes from './routes/api.js';
import loginRoute from './routes/login.js';
import logoutRoute from './routes/logout.js';
import signupRoute from './routes/signup.js';
*/

const log = Logger.child({module:'CribbageServer'});

class CribbageServer {

  constructor() {
      log.info(`CribbageServer: construct`);
      this.app = null;
      log.info(` . port: ${Config.server.port}`);
      this.port = Config.server.port;
      log.info(` . set swagger-jsdoc options`);
      this.jsDocOptions = Config.api.jsDocOptions;
      log.info(` . create session manager`);
      this.sessionManager = new CribbageSessionManager(); 
  }

  // Middleware logger that will log request summary
  createRequestLogger() {
      this.requestLogger = expressWinston.logger({
            winstonInstance: log,
            level: "info",
            meta: true,
            msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
            colorize: true
            //ignoreRoute: function (req, res) { 
            //    const exclude = (/favicon/.test(req.url));   
            //    return exclude; 
            //}
      });
  }

  // Middleware to dump incoming cookies
  static DumpCookie(req, res, next) {
      if ('cookie' in req.headers) {
        log.debug(`Incoming cookie: '${req.headers.cookie} (${req.method} ${req.originalUrl})`); 
      }
      else {
        log.debug(`Incoming cookie: NONE (${req.method} ${req.originalUrl})`); 
      }
      next();
  }
  
  // Middleware to set up an 8-character unuique request ID 
  static SetRequestID(req, res, next) {
      const reqid = uuidv4().substring(0,8);
      httpContext.set('reqid', reqid);
      req.reqid = reqid;
      log.info(`_____________________________`);
      log.info(`HTTP ${req.method} ${req.url}`);
      next(); 
  }

  // Set up all the configuration middleware
  setupMiddleware() {
      log.info(` . set up middleware`);
      log.info(`    . middleware: httpContext`);
      this.app.use(httpContext.middleware);
      log.info(`    . middleware: generate request id`);
      this.app.use(CribbageServer.SetRequestID.bind(this));
      log.info(`    . middleware: express.json`);
      this.app.use(express.json());
      log.info(`    . middleware: session management`);
      this.app.use(this.sessionManager.Middleware());
      log.info(`    . middleware: request logging (winston)`);
      this.app.use(this.requestLogger);
      log.info(`    . middleware: incoming cookie`);
      this.app.use(CribbageServer.DumpCookie.bind(this));
  }


  // Set up endpiont routes
  setupRoutes() {
    log.info(` . set up routes`);

    // backend "home page"
    // TODO remove this and turn into real 'status' endpoint
    log.info(`    . route: /favicon`);
    this.app.get('/favicon.ico', function(req, res) {
      res.sendStatus(204);
    });
      
    log.info(`    . route: /`);
    this.app.get('/', function(req, res){
      res.status(200).json({"message" : "backend server for cribbage game"});
    });

    // Serve a test page for testing socket connectivity
    // TODO: remove
    log.info(`    . route: /socketTest`);
    this.app.get('/socketTest', function(req, res){
      res.sendFile(process.cwd() + '/public/socketTest.html');
    });

    // Swagger docs
    log.info(`    . route: /api-docs`);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(this.apiSpec));

    log.info(`    . route: [ user routes ]`);
    this.app.use('/', userRoutes); 


  /*
    log.info(` . route: /login`);
    this.app.use('/login', loginRoute);
    log.info(` . route: /logout`);
    this.app.use('/logout', logoutRoute);
    log.info(` . route: /signup`);
    this.app.use('/signup', signupRoute);
    log.info(` . route: /api/*`);
    this.app.use('/api', apiRoutes);
*/
  }


  setupErrorHandling() {
    log.info(` . set up error handling`);

    // handle 404 error
    // express doesn't consider not found 404 as an error so we need to set 404
    // if we get here (no route has matched)
    log.info(`    . explicit 404`);
    this.app.use(function(req, res, next) {
        let err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // Generic error handling
    log.info(`    . final 404/500`);
    this.app.use(function(err, req, res, next) {
        if (err.status === 404) {
          log.warn(`Global 404 generated: ${err.message}`);
          res.status(404).json({message: `Not Found`});
        }
        else {
          log.error(`Global 500 generated: ${err.message} (status: ${err.status}), stack ${err.stack}`);
          res.status(500).json({message: `Internal server error`});
        }
    });
  }

  // Return the HTTP server associated with the server
  // (used to multiplex socket.io with backend api)
  get httpServer() {
    return this._httpServer;
  }

  // Start the server 
  async Start() {
    assert(this.app === null, "already started")
    log.info(`CribbageServer start`);
    log.info(` . start session manager`);
    this.sessionManager.Start();
    log.info(` . parse API doc spec`);
    this.apiSpec = await swaggerJsDoc(this.jsDocOptions);
    log.info(` . create express app`); 
    this.app = express();
    // Start up steps in order
    this.createRequestLogger();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
    // Start the server itself
    log.info(` . start server on port ${this.port}`);
    this._httpServer = this.app.listen(this.port, function(){
      log.info(`[ cribbage server successfully listening on port ${this.port} ]`);
    }.bind(this));
  }
}

export default  CribbageServer