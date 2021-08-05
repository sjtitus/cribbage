/*_____________________________________________________________________________
    api
    Module for calling backend API. Uses axios.

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
  _____________________________________________________________________________
*/
import axios from 'axios';
import { strict as assert } from 'assert';
import {GetModuleLogger} from '../util/Logger.js';
const log = GetModuleLogger('api');

export class apiRequest {

    constructor(requestParams, client) {
        assert(client && requestParams && requestParams.url && requestParams.method);
        log.debug(`apiRequest: construct: requestParams=${JSON.stringify(requestParams)}`);
        this.client = client;
        this.params = requestParams;
    }

    // Execute the request
    async execute(onPending=null, onSuccess=null, onError=null, onCancel=null) {
        log.debug(`apiRequest: execute: params=${JSON.stringify(this.params)}`);
        const out = {};
        try {
            onPending && onPending();
            const axiosResponse = await this.client.api.request(this.params);
            // Axios response
            //  `data` is the response that was provided by the server
            //  `status` is the HTTP status code from the server response
            //  `statusText` is the HTTP status message from the server response
            //  `headers` the HTTP headers; e.g. `response.headers['content-type']`
            //  `config` is the config that was provided to `axios` for the request
            //  `request` is the request that generated this response
            log.debug(`apiRequest: success`);
            out.statusCode = axiosResponse.status;
            out.statusText = axiosResponse.statusText;
            out.data = axiosResponse.data;
            out.config = axiosResponse.config;
            out.request = axiosResponse.request;
            out.response = axiosResponse;
            onSuccess && onSuccess(out);
        }
        catch (err) {
            if (err.response) {
              log.error(`apiRequest: error (response received): ${err.message}`);
            }
            else if (err.request) {
              log.error(`apiRequest: error (no response received): ${err.message}`);
            }
            else {
              log.error(`apiRequest: error (no request made): ${err.message}`);
            }
            if (onError) {
              onError(err);
            }
            else {
              throw err;
            }
        }
    }
}

export class apiClient {

    constructor(config) {
        const { baseURL, timeout } = config;
        log.info(`apiClient: construct: baseURL=${baseURL}, timeout=${timeout}`);
        this.api = axios.create(config);
        this.api.defaults.headers.post['Content-Type'] = 'application/json';
    }

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
