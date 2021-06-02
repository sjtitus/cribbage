import Logger from '../util/Logger.js';
import expressWinston from 'express-winston';

const log = Logger.child({module:'RequestLogger'});

const RequestLogger = expressWinston.logger({
    winstonInstance: log,
    level: "info",
    meta: true,
    msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
    colorize: true
    //ignoreRoute: function (req, res) { 
    //    const exclude = (/favicon/.test(req.url));   
    //    return exclude; 
    //}
});

export default RequestLogger;