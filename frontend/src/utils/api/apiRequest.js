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
//import axios from 'axios';
import { strict as assert } from 'assert';
import { GetModuleLogger } from '../Logger.js';
import { v4 as uuidv4 } from 'uuid';


const log = GetModuleLogger(`apiRequest`);

export class apiRequest {

    //__________________________________________________________________________
    // Constructor
    //  client: apiClient the request will run against (see apiClient)
    //  reqConfig: request config (see: axiosConfig) 
    constructor(client, reqConfig, cancelObj=null) {
        assert(client && reqConfig,`apiRequest: must specify a client and a configuration`);
        this._id = uuidv4().substring(0,8);
        log.debug(`[${this._id}]: new request: ${JSON.stringify(reqConfig)}`);
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
        this._canceled = false;
        this._cancelObj = cancelObj;     // cancellation support
        if (cancelObj) {
            log.debug(`[${this._id}]: request is cancellable`); 
            assert(cancelObj.cancel && typeof(cancelObj.cancel === 'function'), 'cancelObj must have function .cancel()');
        } 
        else {
            log.debug(`[${this._id}]: request is NOT cancellable`); 
        }
    }


    //__________________________________________________________________________
    // Run the request asynchronously and return the result
    // Does not throw
    async run(onSuccess=null, onError=null, onCancel=null) {
        assert(this._state === 'new');  // requests run once
        log.debug(`[${this._id}]: running request`); 
        try {
            this._state = 'running';
            this._time.executed = Date.now();
            const res = await this._client.execute(this);
            this._result = {error: false, response: res}; 
            // Axios success response
            //  `data` is the response that was provided by the server
            //  `status` is the HTTP status code from the server response
            //  `statusText` is the HTTP status message from the server response
            //  `headers` the HTTP headers; e.g. `response.headers['content-type']`
            //  `config` is the config that was provided to `axios` for the request
            //  `request` is the request that generated this response
            this._time.finished = Date.now();
            this._state = 'success';
            log.debug(`[${this._id}]: success`);
        }
        catch (err) {
            const requestSent = Boolean(err.request);
            const responseReceived = Boolean(err.response);
            this._result = { 
               error: err,
               requestSent: requestSent,
               responseReceived: responseReceived, 
               response: (responseReceived) ? err.response:null }; 
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
            log.error(`[${this._id}]: error (requestSent=${requestSent}, responseReceived=${responseReceived}): ${err.message}`);
        }
        finally {
            assert(this._state !== 'running');
            assert(this._state !== 'new');
            assert(this._result);
            assert(this._time.finished>0 && this._time.executed>0);
            assert(this._time.finished >= this._time.executed);
            this._time.durationMillisec = (this._time.finished - this._time.executed);
            switch (this._state) {
                case 'success':
                    onSuccess && onSuccess(this);
                    break;
                case 'error':
                    onError && onError(this);
                    break;
                case 'canceled':
                    onCancel && onCancel(this);
                    break;
                default:
                    log.error(`[${this._id}]: illegal final state ${this._state}`);
                    break; 
            }
            log.debug(`[${this._id}]: complete: state=${this._state}, duration (msec): ${this._time.durationMillisec}`);
            return this._result; 
        }
    }

    //__________________________________________________________________________
    // Clone this request: return a new identical request with a diff ID
    clone() {
        log.debug(`[${this._id}]: generating a fresh (clone) request`);
        return this._client.request(this._config);
    }
    
    //__________________________________________________________________________
    // Cancel a running request
    // Does not throw
    // Returns true/false on successful/failed cancel. 
    cancel(message) {
        assert(this._canceled === false);  // no re-canceling
        log.debug(`[${this._id}]: attempting to cancel request`);
        if (this._state !== 'running') {
            log.warn(`[${this._id}]: cannot cancel non-running request (state: ${this._state})`);
            return false;
        }
        if (!this._cancelObj) {
            log.error(`[${this._id}]: cancel called with no cancelObj set`);
            return false
        }
        try {
            this._canceled = true;
            // this should trigger an error (catch block) in the run() method above
            const msg = message || `request ${this._id} was cancelled`;
            this._cancelObj.cancel(msg);
            log.debug(`[${this._id}]: cancel succeeded`);
            return true;
        }
        catch (err) {
            this._canceled = false;
            log.error(`[${this._id}]: cancel failed with error (${err.message})`);
            return false;
        }
    } 
}