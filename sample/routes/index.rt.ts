import { Router, Request, Response } from 'express'
import { ExpressApp } from '../../src/libs/ExpressApp'

export default function route (app: ExpressApp, router: Router): void {
    router.get('/', async (req: Request, res: Response) => {
        res.send("WOW!")
    })
    router.get('/test', async (req: Request, res: Response) => {
        res.send("YO!")
    })
}
