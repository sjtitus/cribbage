import session from 'express-session';
import mstore from 'memorystore';
import Logger from '../util/Logger.js';
import Config from '../../config/Config.js';
import { strict as assert } from 'assert';

const log = Logger.child({module:'SessionManager'});
const MemoryStore = mstore(session);

class CribbageSessionManager {

    constructor() {
        log.info(` . construct`);
        this.middleware = null; 
        this.sessionConfig = Config.server.session;
        this.storeConfig = Config.server.sessionStore; 
        log.info(`    . creating new session memorystore`);
        // use MemoryStore for storing sessions
        this.store = new MemoryStore({
            checkPeriod: this.storeConfig.checkPeriod, 
            noDisposeOnSet: this.storeConfig.noDisposeOnSet,
            dispose: (key, val) => { log.debug(`session memorystore: deleting key ${key} (value=${val})`); },
        });
    }

    Start() {
        assert(this.middleware === null, "already started");        
        log.info(`    . session (cookie) name: ${this.sessionConfig.name}`); 
        log.info(`    . session resave: ${this.sessionConfig.resave}`); 
        log.info(`    . session saveUnitialized: ${this.sessionConfig.saveUninitialized}`); 
        log.info(`    . session cookie httpOnly: ${this.sessionConfig.cookie.httpOnly}`); 
        log.info(`    . session cookie secure: ${this.sessionConfig.cookie.secure}`); 
        log.info(`    . session cookie sameSite: ${this.sessionConfig.cookie.sameSite}`); 
        if (!('maxAge' in this.sessionConfig.cookie)) {
            log.info(`    . session cookie maxAge: undefined (expires on browser close)`); 
        }
        else {
            log.info(`    . session cookie maxAge: ${this.sessionConfig.cookie.maxAge}`); 
        }
        log.info(`    . memorystore: sessions reaped every ${this.storeConfig.checkPeriod/(1000*60*60)} hours`);
        this.store.startInterval();
        this.middleware = session(this.sessionConfig);
    }

    Middleware() {
        assert(this.middleware !== null, "need to start");
        return this.middleware;
    }
}

export default CribbageSessionManager;
