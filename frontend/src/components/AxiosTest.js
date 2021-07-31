import { useAxios } from '../hooks/useAxios.js';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { useState } from 'react';

export const AxiosTest = (props) => {

    const [fire, setFire] = useState(false);

    const { response, loading, error } = useAxios({
        method: 'GET',
        url: '/delayTest?delayMillis=5000',
        headers: { // no need to stringify
          accept: '*/*'
        }
        /*
        data: {  // no need to stringify
            userId: 1,
            id: 19392,
            title: 'title',
            body: 'Sample text',
        },
        */
    }, fire);
    
    console.log(`rendering axiosTest`);

    const ButtonClick = (e) => {
        setFire(!fire); 
        console.log(`fire is ${fire}`);
    }

    return (
        <div className='App'>
            <Link to="/game"> Game Page </Link>
            <Button onClick={ButtonClick}> Call API </Button>
            <h1>Posts</h1>

            {loading ? (
                <p>loading...</p>
            ) : (
                <div>
                    {error && (
                        <div>
                            <p>ERROR {error.message}</p>
                        </div>
                    )}
                    <div> {
                      // no need to use another state to store data, response is sufficient
                      // response && <p>hello</p>
                      //response.map((e,i) => <div>{JSON.stringify(e)} key={i}</div>)
                      //response && response.map((e,i) => <div key={i}>{JSON.stringify(e)}</div>)
                      <div>{response.message} </div>
                    }
                    </div>
                </div>
            )}
        </div>
    );
};
