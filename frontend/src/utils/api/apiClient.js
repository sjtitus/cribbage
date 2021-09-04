/*_____________________________________________________________________________
    see also: apiRequest.
  _____________________________________________________________________________
*/
import axios from 'axios';
import { strict as assert } from 'assert';
import { apiRequest } from './apiRequest.js';
import { GetModuleLogger } from '../Logger.js';
import Config from '../../config/Config.js';

const log = GetModuleLogger('apiClient');

//_____________________________________________________________________________
// Singleton instance 
let instance = null;

class apiClient {

    constructor(config) {
        const { baseURL, timeout } = config;
        log.debug(`Construct: baseURL=${baseURL}, timeout=${timeout}`);
        this._api = axios.create(config);
        // set up for JSON payload: TODO: is there more here?
        this._api.defaults.headers.post['Content-Type'] = 'application/json';
    }

    // create a new request that will execute using this client
    request(apiRequestConfig) {
        log.debug(`Create request: config=${JSON.stringify(apiRequestConfig)}`);
        // do cancellation automatically for convenience 
        const source = axios.CancelToken.source();
        apiRequestConfig.cancelToken = source.token;
        const req = new apiRequest(this, apiRequestConfig, source);
        log.debug(`New request id: ${req._id}`);
        return req; 
    }

    // Execute a request 
    async execute(apiRequest) {
        log.debug(`Executing request: ${apiRequest._id}`);
        const axiosResponse = await this._api.request(apiRequest._config);
        return axiosResponse;
    }
}

//__________________________________________________________________________________________________
// Singleton implementation
function getSingleton() {
    if (instance === null) {
        log.debug(`Creating singleton apiClient instance`);
        instance = new apiClient(Config.apiClient); 
    }
    log.debug(`Returning singleton apiClient instance`);
    return instance;
}

export default {
    Instance: getSingleton,
}