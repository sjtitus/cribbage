/*_____________________________________________________________________________
    apiRequest

    A backend API client request (e.g. get, post, put, delete).
        Success Response
            statusCode
            statusText
            data
            config
            request
            response
            error
            errorText

        Error Response
            code (string)
            message
            config
            request
            response
            stack
            toJSON()

    see also: apiClient
  _____________________________________________________________________________
*/
import axios from 'axios';
import { strict as assert } from 'assert';
import {GetModuleLogger} from '../util/Logger.js';
import { v4 as uuidv4 } from 'uuid';
const log = GetModuleLogger('apiRequest');


export class apiRequest {

    //__________________________________________________________________________
    // Constructor
    //  client: apiClient the request will run against (see apiClient)
    //  reqConfig: request config (see: axiosConfig) 
    constructor(client, reqConfig) {
        assert(client && reqConfig,`apiRequest: must specify a client and a configuration`);
        this._id = uuidv4().substring(0,8);
        log.debug(`apiRequest [${this._id}]: new request [${client.baseURL}]: ${JSON.stringify(reqConfig)}`);
        this._client = client;
        this._config = reqConfig;
        this._state = 'new';    // new, running, success, error, canceled
        this._time = {
            created: Date.now(),     // epoch times
            executed: 0,       
            finished: 0,   
            durationMillisec: -1
        }
        this._result = null;
        this._cancelObj = null;     // cancellation support
        this._canceled = false; 
    }

    //__________________________________________________________________________
    // cancelObj (set): cancelObj.cancel() will cancel execution 
    set cancelObj(obj) {
        assert(obj.cancel && typeof(obj.cancel === 'function'), 'cancelObj must have function .cancel()');
        this._cancelObj = obj;
    }

    //__________________________________________________________________________
    // Run the request asynchronously and return the result
    // Does not throw (result.err is non-null on error)
    async run() {
        assert(this._state === 'new');  // requests run once
        log.debug(`apiRequest [${this._id}]: run request`); 
        try {
            this._state = 'running';
            this._time.executed = Date.now();
            const res = await this._client.execute(this);
            this._result = res;
            // Axios success response
            //  `data` is the response that was provided by the server
            //  `status` is the HTTP status code from the server response
            //  `statusText` is the HTTP status message from the server response
            //  `headers` the HTTP headers; e.g. `response.headers['content-type']`
            //  `config` is the config that was provided to `axios` for the request
            //  `request` is the request that generated this response
            this._time.finished = Date.now();
            this._state = 'success';
            log.debug(`apiRequest [${this._id}]: success`);
        }
        catch (err) {
            this._result = err;
            // Axios error response
            //  code (string)
            //  message
            //  config
            //  request
            //  response
            //  stack
            //  toJSON()
            this._state = (this._canceled) ? 'canceled':'error';
            this._time.finished = Date.now();
            if (err.response) {
              log.error(`apiRequest [${this._id}]: error (response received): ${err.message}`);
            }
            else if (err.request) {
              log.error(`apiRequest [${this._id}]: error (no response received): ${err.message}`);
            }
            else {
              log.error(`apiRequest [${this._id}]: error (no request made): ${err.message}`);
            }
        }
        finally {
            assert(this._result);
            assert(this._time.finished>0 && this._time.executed>0);
            assert(this._time.finished >= this._time.executed);
            this._time.durationMillisec = (this._time.finished - this._time.executed);
            log.debug(`apiRequest [${this._id}]: finished: duration (msec): ${time._time.durationMillisec}`);
            return this.result; 
        }
    }
    
    //__________________________________________________________________________
    // Cancel a running request
    // Does not throw
    // Returns true/false on successful/failed cancel. 
    cancel() {
        assert(this._canceled === false);  // no re-canceling
        log.debug(`apiRequest [${this.id}]: attempting to cancel request`);
        if (this._state !== 'running') {
            log.warn(`apiRequest [${this.id}]: cannot cancel non-running request (state: ${this._state})`);
            return false;
        }
        if (!this._cancelObj) {
            log.error(`apiRequest [${this.id}]: cancel called with no cancelObj set`);
            return false
        }
        try {
            this._canceled = true;
            // this should trigger an error (catch block) in the run() method above
            this._cancelObj.cancel();
            log.debug(`apiRequest [${this.id}]: cancel succeeded`);
            return true;
        }
        catch (err) {
            this._canceled = false;
            log.error(`apiRequest [${this.id}]: cancel failed with error (${err.message})`);
            return false;
        }
    } 
}