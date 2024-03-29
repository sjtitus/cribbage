/* _____________________________________________________________________________
    Logger
    Simple logger using winston.
  ______________________________________________________________________________
*/
import httpContext from 'express-http-context';
import winston from 'winston';
import Config from '../config/Config.js';

//const logFileName = Config.logFilePath;

const ModuleFormat = winston.format(info => {
    if (!('module' in info)) {
        info.module = "main";
    }
    info.module = info.module.substr(0,20);
    info.module = `[${info.module}]`;
    info.module = info.module.padStart(22);

    const reqid = httpContext.get('reqid');
    info.reqid = (reqid) ? reqid.substr(0,8):'========';
    info.message = `[${info.reqid}] ${info.message}`;
    return info;
});

const SingleFormat =  winston.format.combine(
                ModuleFormat(),
                winston.format.timestamp(),
                winston.format.align(),
                winston.format.printf(info => `${info.timestamp} ${info.module} ${info.level} ${info.message}`)
);

const ConsoleTransport = 
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.printf(info => `${info.timestamp} ${info.module} ${info.level} ${info.message}`)
                    ),
                    handleExceptions: true
                });
ConsoleTransport._maxListeners = 30;


// Create/Get a logger for a specific code module.
// Logging level for the module set in config file Config.logLevels
export function GetModuleLogger(moduleName) {
    if (!winston.loggers.has(moduleName)) {
        const level = (Config.logLevels[moduleName]) ? Config.logLevels[moduleName]:Config.logLevelDefault;
       winston.loggers.add(moduleName, {
            format: SingleFormat, 
            level: level,
            transports: [ ConsoleTransport ],
        });
    }
    const newLogger = winston.loggers.get(moduleName).child({module:moduleName});
    return newLogger; 
}
