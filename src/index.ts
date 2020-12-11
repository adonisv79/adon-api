import { Express } from 'express';
import ExpressApp, { ExpressAppConfig } from './libs/ExpressApp';
import config from './config';
import logger from './libs/Logger';

let app: ExpressApp;

export type APIConfig = {
    name: string,
}

async function onHealthCheck(): Promise<boolean> {
    // test dependencies like redis, mongodb, etc. state
    // for now simulate all are ok
    return true;
  }
  
  async function onLoading(e: Express): Promise<void> {
    // await Models.init(config.mongodb.connectionString.main);
    // loadRoutes(e);
  }
  
  async function onReady(): Promise<void> {
    // if (!config.dev.disableAutoJobTriggers) {
    //   logger.info('Automated Job Triggers activated...');
    //   schedTasks.start();
    // }
    // HerokuWaker(); // keeps our app alive in heroku env
    app.start();
  }
  
  const cfg: ExpressAppConfig = {
    port: config.server.port,
    onHealthCheck,
    onReady,
    onLoading,
    logger,
  };
  app = new ExpressApp(cfg);