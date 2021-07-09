import { useAxios } from '../hooks/useAxios.js';
import { Link } from 'react-router-dom';

export const AxiosTest = (props) => {

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
    });

    return (
        <div className='App'>
            <Link to="/game"> Game Page </Link>
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
                      response && response.map((e,i) => <div key={i}>{JSON.stringify(e)}</div>)
                    }
                    </div>
                </div>
            )}
        </div>
    );
};
