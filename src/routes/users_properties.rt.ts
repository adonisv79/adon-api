import { Router, Request, Response, NextFunction } from 'express';

export default function route (router: Router) {
    router.get('/', async (req: Request, res: Response, next: NextFunction) => {
        res.send("WOW!")
    })
    router.get('/test', async (req: Request, res: Response, next: NextFunction) => {
        res.send("YO!")
    })
}