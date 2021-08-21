/*_________________________________________________________________________________________________
 * useAxios
 * Hook for making Ajax calls to backend API
 *__________________________________________________________________________________________________
 */

import { useState, useEffect } from 'react';

import {GetModuleLogger} from '../utils/Logger.js';
const log = GetModuleLogger(`useAxios`);

export const useAxios = (apiRequest) => {
   
    const [apiRequestState, setApiRequestState] = useState({ loading: true, result: null});

    log.debug(`loading=${apiRequestState.loading}, result=${apiRequestState.result}`);

    function onSuccess(res) { 
        log.debug(`api request success: setting result`); 
        setApiRequestState({ loading: false, result: res })
    }
    
    function onError(res) { 
        log.debug(`api request error: setting result`); 
        setApiRequestState({ loading: false, result: res })
    }
    
    function onCancel(res) { 
        log.debug(`api request cancel: setting result`); 
        setApiRequestState({ loading: false, result: res })
    }

    const fetchData = async (req) => {
            log.debug(`executing api request [${req._id}] (${JSON.stringify(req)})`); 
            const result = await req.run(onSuccess, onError, onCancel);
            log.debug(`api request [${req._id}] complete`);
    };

    useEffect(() => {
        log.debug(`useEffect: apiRequest state is ${apiRequest._state}`);
        if (apiRequest._state !== "new") {
            log.debug(`generating new API request (current request [${apiRequest._id}] state is ${apiRequest._state})`);
            apiRequest = apiRequest.clone();
        }
        fetchData(apiRequest);
        return () => {
            log.warn(`canceling request ${apiRequest._id}: component unmounted`);
            apiRequest.cancel(`canceling request ${apiRequest}: component unmounted`);
        };
    }, []);

    // return dynamic API request state 
    return apiRequestState;
};