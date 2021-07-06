/* _____________________________________________________________________________
    Logger
    Simple logger using winston.
  ______________________________________________________________________________
*/
import winston from 'winston';

const logLevel = 'debug';

const ModuleFormat = winston.format(info => {
    if (!('module' in info)) {
        info.module = "main";
    }
    info.module = info.module.substr(0,20);
    info.module = `[${info.module}]`;
    info.module = info.module.padStart(22);
    info.level = info.level.padStart(9,' ');
    return info;
});

const Logger = winston.createLogger({
    format: winston.format.combine(
        ModuleFormat(),
        winston.format.timestamp(),
        winston.format.align(),
        winston.format.printf(info => `${info.timestamp} ${info.module} ${info.level} ${info.message}`)
    ),
    level: logLevel,
    transports: [
        /*
        new winston.transports.File({ 
            filename: logFileName, 
            level: logLevel,
            handleExceptions: true
        }),
        */
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(info => `${info.timestamp} ${info.module} ${info.level} ${info.message}`)
            ),
            handleExceptions: true
        }),
    ],
});

/*
export const APILogger = winston.createLogger({
    format: winston.format.combine(
        ModuleFormat(),
        winston.format.timestamp(),
        winston.format.align(),
        winston.format.printf(info => `${info.timestamp} ${info.module}\t${info.level} ${info.message}`)
    ),
    level: logLevel,
    transports: [
        new winston.transports.File({ 
            filename: APIlogFileName, 
            level: APIlogLevel,
            handleExceptions: true
        }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(info => `${info.timestamp} ${info.module} ${info.level} ${info.message}`)
            ),
            handleExceptions: true
        }),
    ],
});
*/

export default Logger;