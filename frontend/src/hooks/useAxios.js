/*_________________________________________________________________________________________________
 * useAxios
 * Hook for making Ajax calls to backend API
 *__________________________________________________________________________________________________
 */

import { useState, useEffect } from 'react';
import axios from 'axios';

import Logger from '../utils/Logger';
const log = Logger.child({module:'useAxios'});


//axios.defaults.baseURL = 'https://jsonplaceholder.typicode.com';
axios.defaults.baseURL = 'http://localhost:8080';
    
export const useAxios = (axiosParams, trigger=null) => {

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
        if ((trigger === null) || (trigger)) {
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
        }
    }, (trigger !== null) ? [trigger]:[]);

    // return states that will change depeding on state of API request
    return { response, error, loading };
};