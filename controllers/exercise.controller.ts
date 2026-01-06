import { Router, Request, Response } from "express";
import { ExerciseService } from "../services/mongoose/services/exercise.service";

export class ExerciseController {
    constructor(private exerciseService: ExerciseService) {}

    async create(req: Request, res: Response) {
        try {
            const exercise = await this.exerciseService.createExercise(req.body);
            res.status(201).json(exercise);
        } catch (err) {
            res.status(400).json({ message: "Erreur création exercice", error: err });
        }
    }

    async getAll(req: Request, res: Response) {
        const exercises = await this.exerciseService.findAll();
        res.json(exercises);
    }

    async update(req: Request, res: Response) {
        try {
            const exercise = await this.exerciseService.updateExercise(req.params.id, req.body);
            if (!exercise) return res.status(404).json({ message: "Exercice introuvable" });
            res.json(exercise);
        } catch (err) {
            res.status(400).json({ message: "Erreur modification exercice", error: err });
        }
    }

    async delete(req: Request, res: Response) {
        const success = await this.exerciseService.deleteExercise(req.params.id);
        res.status(success ? 204 : 404).end();
    }

    buildRouter(): Router {
        const router = Router();
        router.post('/', this.create.bind(this));      
        router.get('/all', this.getAll.bind(this)); 
        router.get('/:id', this.getAll.bind(this)); 
        router.put('/:id', this.update.bind(this));    
        router.delete('/:id', this.delete.bind(this)); 
        return router;
    }
}