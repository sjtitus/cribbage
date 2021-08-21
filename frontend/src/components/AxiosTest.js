import apiClient from '../api/apiClient';
import { useAxios } from '../hooks/useAxios.js';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { useState } from 'react';
    
const api = apiClient.Instance({baseURL: 'http://localhost:8080', timeout: 5000});

const apiRequest = api.request({
        method: 'get',
        url: '/delayTest',
        params: { delayMillis: 3000 },
        headers: { accept: '*/*' }
});


export const AxiosTest = (props) => {

    const apiState = useAxios(apiRequest);
    
    console.log(`srt: rendering axiosTest: loading=${apiState.loading}, response=${apiState.result}`);

    const ButtonClick = (e) => {
        console.log(`click`);
    }

    return (
        <div className='App'>
            <Link to="/game"> Game Page </Link>
            <Button onClick={ButtonClick}> Call API </Button>
            <h1>Posts</h1>

            {apiState.loading ? (
                <p>loading...</p>
            ) : (
                <div>
                    {
                        apiState.result && (
                            <div>
                                <p>ApiResponse received: state: {apiState.result._state}</p>
                            </div>
                        )
                    }
                    <div>
                                <p>Loading done</p>
                    </div>
                </div>
            )}
        </div>
    );
};
