import {Router, Request, Response} from "express";

export class HealthCheckController {

    async healthCheck(req: Request, res: Response) {
        res.status(204).end();
    }

    buildRouter(): Router {
        const router = Router();
        router.get('/', this.healthCheck.bind(this));
        return router;
    }
}
