/*_________________________________________________________________________________________________
 * useAxios
 * Hook for making Ajax calls to backend API
 *__________________________________________________________________________________________________
 */

import { useState, useEffect } from 'react';

import {GetModuleLogger} from '../utils/Logger.js';
const mn = 'srt:UseAxios';
const log = GetModuleLogger(`${mn}`);

export const useAxios = (apiRequest) => {
   
    const [apiRequestState, setApiRequestState] = useState({ loading: true, result: null});

    log.debug(`${mn}: loading=${apiRequestState.loading}, result=${apiRequestState.result}`);
    let unmounted = false;

    function onSuccess(res) { 
        log.debug(`${mn}: api request success: setting result`); 
        setApiRequestState({ loading: false, result: res })
    }
    
    function onError(res) { 
        log.debug(`${mn}: api request error: setting result`); 
        setApiRequestState({ loading: false, result: res })
    }
    
    function onCancel(res) { 
        log.debug(`${mn}: api request cancel: setting result`); 
        setApiRequestState({ loading: false, result: res })
    }

    const fetchData = async (req) => {
            log.debug(`${mn}: executing api request [${req._id}] (${JSON.stringify(req)})`); 
            const result = await req.run(onSuccess, onError, onCancel);
            log.debug(`${mn}: api request [${req._id}] complete`);
    };

    useEffect(() => {
        log.debug(`${mn}: useEffect: apiRequest state is ${apiRequest._state}`);
        if (apiRequest._state !== "new") {
            log.debug(`${mn}: generating new API request (current request [${apiRequest._id}] state is ${apiRequest._state})`);
            apiRequest = apiRequest._client.request(apiRequest._config);
        }
        fetchData(apiRequest);
        return () => {
            unmounted = true;
            log.warn(`${mn}: canceling request ${apiRequest._id}: component was unmounted`);
            apiRequest.cancel(`${mn}: canceling request ${apiRequest}: component was unmounted`);
        };
    }, []);

    // return dynamic API request state 
    return apiRequestState;
};