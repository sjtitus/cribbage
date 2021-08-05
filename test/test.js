import { apiClient, apiRequest } from './api/api.js'
import {GetModuleLogger} from './util/Logger.js';
import { WaitThenExit } from './util/ProcessUtils.js';
const log = GetModuleLogger('Test');

log.info(`Starting API test`);

/*
async function async3() {
    await new Promise(resolve => setTimeout(resolve, 3000));
    log.info(`returning 3`);
    return 3;
}

async function async5() {
    await new Promise(resolve => setTimeout(resolve, 5000));
    log.info(`returning 5`);
    return 5;
}

async function async7() {
    await new Promise(resolve => setTimeout(resolve, 7000));
    log.info(`returning 7`);
    return 7;
}

log.info(`running 7`);
const res7 = async7();
log.info(`running 5`);
const res5 = async5();
log.info(`running 3`);
const res3 = async3();

const [o3,o5,o7] = await Promise.all([res3,res5,res7]);


log.info(`Finished API test: ${o3}, ${o5}, ${o7}`);
process.exit(0);
*/


//const client = new apiClient('http://jsonplaceholder.typicode.com',5000);
const client = new apiClient({baseURL: 'http://localhost:8080', timeout: 5000});

const requestParams = {
    method: 'get',
    url: '/delayTest',
    params: { delayMillis: 7000 }
};

const req = new apiRequest(requestParams, client);

req.execute().then( (out) => {
      log.info(`out: normal exit`);
}).catch((e) => {
      log.error(`out: error ${e}`);
});

/*
(async function() {
  log.info('waiting at top level');
  await WaitThenExit(5);
}());
*/

log.info(`waiting to script to end`);

/*
const requestParams2 = {
    method: 'put',
    url: '/delayTest',
    params: { delayMillis: 3000 }
};

const req2 = new apiRequest(requestParams2, client);
const onLoading = (res) => { log.info(`loading...`); }
const onSuccess = (res) => { log.info(`success: status = ${res.status}`); }
const onError = (res) => { log.info(`error: ${JSON.stringify(res.error)}`); }
req2.execute(onLoading, onSuccess, onError);

*/
