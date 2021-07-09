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
    
export const useAxios = (axiosParams) => {

    const [response, setResponse] = useState(undefined);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchData = async (params) => {
      try {
            log.debug(`API: executing request (${JSON.stringify(params)})`); 
            const result = await axios.request(params);
            log.debug(`API: request successful`); 
            setResponse(result.data);
       } catch( error ) {
            log.error(`API: request error ${error.message}`); 
            setError(error);
       } finally {
            setLoading(false);
       }
    };

    useEffect(() => {
        const cancelTokenSource = axios.CancelToken.source();
        axiosParams.cancelToken = cancelTokenSource.token;
        fetchData(axiosParams);
        return () => {
            cancelTokenSource.cancel();
            log.debug(`API: request canceled (component unmounted)`); 
        };
    }, []);

    // return states that will change depeding on state of API request
    return { response, error, loading };
};