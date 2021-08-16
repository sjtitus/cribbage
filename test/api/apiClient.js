/*_____________________________________________________________________________
    see also: apiRequest.
  _____________________________________________________________________________
*/
import axios from 'axios';
import { strict as assert } from 'assert';
import { apiRequest } from './apiRequest.js';
import { GetModuleLogger } from '../util/Logger.js';
const log = GetModuleLogger('apiClient');


//_____________________________________________________________________________
// Singleton instance 
let instance = null;

class apiClient {

    constructor(apiClientConfig) {
        const { baseURL, timeout } = apiClientConfig;
        log.debug(`Construct: baseURL=${baseURL}, timeout=${timeout}`);
        this._api = axios.create(apiClientConfig);
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
        log.debug(`Execute reqquest ${apiRequest._id}`);
        const axiosResponse = await this._api.request(apiRequest._config);
        return axiosResponse;
    }
}

//__________________________________________________________________________________________________
// Singleton implementation
function getSingleton(apiClientConfig) {
    if (instance === null) {
        assert(apiClientConfig);
        log.debug(`Creating singleton apiClient instance`);
        instance = new apiClient(apiClientConfig); 
    }
    else {
        assert(!apiClientConfig);
    }
    log.debug(`Returning singleton apiClient instance`);
    return instance;
}

export default {
    Instance: getSingleton,
}



/*
export const useAPI = (axiosParams) => {

    const [response, setResponse] = useState(undefined);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [requestNum, setRequestNum] = useState(0);

    log.debug(`executing UseAxios`);
    let unmounted = false;

    const fetchData = async (params) => {
      try {
            setRequestNum(requestNum+1);
            log.debug(`API: executing request (${JSON.stringify(params)})`);
            const result = await axios.request(params);
            log.debug(`API: request ${requestNum} successful`);
            setResponse(result.data);
       } catch( error ) {
            log.error(`API: request ${requestNum} error ${error.message}`);
            if (!unmounted) {
                setError(error);
            }
       } finally {
           if (!unmounted) {
                log.debug(`API: request ${requestNum} setting loading to false`);
                setLoading(false);
           }
       }
    };

    useEffect(() => {
            const cancelTokenSource = axios.CancelToken.source();
            axiosParams.cancelToken = cancelTokenSource.token;
            log.debug(`fetching data with cancelToken: ${JSON.stringify(axiosParams.cancelToken)}`);
            log.debug(`request numbers: ${requestNum}`);
            fetchData(axiosParams);
            return () => {
                unmounted = true;
                cancelTokenSource.cancel(`canceling request ${requestNum}: component was unmounted`);
                log.warn(`canceling request ${requestNum}: component was unmounted`);
            };
        });

    // return states that will change depeding on state of API request
    return { response, error, loading };
};

*/
