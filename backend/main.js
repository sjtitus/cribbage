
import Config from './config/Config.js';
import CribbageServer from './src/server/CribbageServer.js'
import {Server as SocketIOServer} from 'socket.io';
import Database from './src/database/Database.js'
import {WaitThenExit, InstallTopLevelHandlers} from './src/util/ProcessUtils.js';

import {GetModuleLogger} from './src/util/Logger.js';
const Logger = GetModuleLogger('main');

//_________________________________________________________________________________________________
// Global error handlers
// Handle unhandled promise rejections by logging and exiting
const unhandledRejectionHandler = (error) => {
    //Logger.error(`** Global handler: unhandledRejection (exiting): ${error.message}, ${error.stack}`);
    process.exit(-1);
};
// Handle uncaught exceptions by logging and exiting
const uncaughtExceptionHandler = (error) => {
    //Logger.error(`** Global handler: uncaughtException (exiting): ${error.message}, ${error.stack}`);
    process.exit(-2);
};

const exitHandler = (code) => {
    Logger.info(`** Global handler: exit event: exiting with code ${code}`);
}


Logger.info(``);
Logger.info(``);
Logger.info(`___________________________________________________________`);
Logger.info(`Start backend`);

Logger.info(``);
Logger.info(`__________ Install process-level exception handlers`);
InstallTopLevelHandlers(unhandledRejectionHandler, uncaughtExceptionHandler, exitHandler);

Logger.info(``);
Logger.info(`__________ Confirm database connectivity`);
const db = Database.Instance('main');
//await db.TestConnection();
db.TestConnection()
  .then(Logger.info(`testconnection complete`));

Logger.info(``);
Logger.info(`__________ Initialize backend API/socket servers`);
let cribbageServer = new CribbageServer();
Logger.info(`Create socket server`);
const socketServer = new SocketIOServer();

Logger.info(``);
Logger.info(`__________ Start backend API/socket servers`);
//await cribbageServer.Start();
cribbageServer.Start().then( () => {

  Logger.info(`cserver start complete`);
  let httpServer = cribbageServer.httpServer;
  Logger.info(`SocketServer start`);
  let io = socketServer.listen(httpServer);

  Logger.info(``);
  Logger.info(`Start backend: complete`);
  Logger.info(`___________________________________________________________`);
  Logger.info(``);

  // TODO: move this
  io.on('connection', function (socket) {
    Logger.info(`[ socket user connected ]`)
    socket.on('disconnect', function(){
      Logger.info('[ socket user disconnected ]');
    });
    socket.on('chat message', function(msg){
      Logger.info(`[ socket message: ${msg} ]`);
      io.emit('chat message', msg);
    });
  });

});

