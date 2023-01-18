import { ExpressApp, Router, Request, Response } from '../../src'

export default function route(app: ExpressApp, router: Router): void {
  router.get('/', async (req: Request, res: Response) => {
    res.send('This is the root main route')
    app.log.debug('Response sent!', { traceToken: req.headers['trace-token'] })
  })

  router.get('/test', async (req: Request, res: Response) => {
    res.send('This is the root test route')
    app.log.debug('Response sent!', { traceToken: req.headers['trace-token'] })
  })
}
