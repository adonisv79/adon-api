import { Router, Request, Response } from 'express'
import { ExpressApp } from '../../src/ExpressApp'

export default function route(_app: ExpressApp, router: Router): void {
  router.get('/', async (_req: Request, res: Response) => {
    res.send('Properties root!')
  })
  router.get('/test', async (_req: Request, res: Response) => {
    res.send('properties test route')
  })
}
