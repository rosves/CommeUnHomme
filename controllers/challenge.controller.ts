import { Router, Request, Response } from "express";
import {
  GymService,
  UserService,
  ChallengeService,
} from "../services/mongoose/services/";
import { authMiddleware, requireRole } from "../utils/middlewares";
import { UserRole } from "../models/user.interface";
import { Gym } from "../models";
import { Types } from "mongoose";

export class ChallengeController {
  constructor(
    private gymService: GymService,
    private userService: UserService,
    private challengeService: ChallengeService
  ) {}

  async CreateChallenge(req: Request, res: Response) {
    try {
      const { name, description, difficulty, duration } = req.body;
      const gymId = req.params.id;

      if (
        name === null ||
        description === null ||
        difficulty === null ||
        duration === null
      ) {
        return res.status(404).json({ message: "Argument non fourni" });
      }

      const gym: Gym | null = await this.gymService.findById(req.params.id);
      if (!gym) {
        return res.status(404).json({ message: "Salle introuvable" });
      }
      const ChallengeCreatead = await this.challengeService.createChallenge({
        name,
        description,
        difficulty,
        duration,
        gymId: gym._id,
        createdBy: gym.ownerId,
      });
      console.log(ChallengeCreatead);
      if (!ChallengeCreatead) {
        res.status(400).json({ message: "Erreur lors de la création du défi" });
      }
      res.status(200).send("Défi ajouté");
    } catch (err) {
      res
        .status(400)
        .json({ message: "Erreur de création du défi", error: err });
    }
  }

  buildRouter(): Router {
    const router = Router();

    router.post(
      "/createChallenge/:id",
      authMiddleware,
      requireRole(UserRole.OWNER),
      this.CreateChallenge.bind(this)
    );

    return router;
  }
}
