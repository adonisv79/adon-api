import e, { Express} from 'express';
import ExpressApp from '.';
import fs from 'fs';
import path from 'path'

const MODULE_NAME = 'EXPRESSAPP_ROUTEMANAGER';

export default class RouteManager {
    private app: ExpressApp;
    private routePath: string;

    constructor(app: ExpressApp) {
        this.app = app;
        this.routePath = `${this.app.rootDir}/routes`;
    }

    async init() {
        const files = fs.readdirSync(this.routePath);
        const routeNames = files.filter((f) => {
            const fname = f.split('.')
            if (fname.length === 3 && fname[1].toLowerCase() === 'rt' && (fname[2].toLowerCase() === 'ts' || fname[2].toLowerCase() === 'js')){
                return true;
            }
        })
        this.app.log.info(`[${MODULE_NAME}]: Found ${routeNames.length} route(s)`);
        if (routeNames.length > 0) {
            for (let i = 0; i < routeNames.length; i++) {
                const router = e.Router();
                const routeFilePath = `${this.routePath}/${routeNames[i]}`;
                const loadRouter = await import(routeFilePath);
                this.app.log.info(`[${MODULE_NAME}]: Loading route file ${routeFilePath}`);
                console.dir(loadRouter)
                await loadRouter.default(router);
                const fname = routeNames[i].split('.')
                let routeName = '/';
                if (fname[0].toLowerCase() !== 'index') {
                    routeName = '/' + fname[0].split('_').join('/')
                }
                this.app.express.use(routeName, router);
                this.app.log.info(`[${MODULE_NAME}]: route created for ${routeName}`);
            }
        }
    }
}