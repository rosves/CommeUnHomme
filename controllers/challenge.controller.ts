import { Router, Request, Response } from "express";
import {
  GymService,
  UserService,
  ChallengeService,
} from "../services/mongoose/services/";
import { authMiddleware, requireRole } from "../utils/middlewares";
import { UserRole } from "../models/user.interface";
import { Gym, Challenge } from "../models";

export class ChallengeController {
  constructor(
    private gymService: GymService,
    private userService: UserService,
    private challengeService: ChallengeService
  ) {}

  async CreateChallenge(req: Request, res: Response) {
    try {
      const {
        name,
        description,
        difficulty,
        duration,
        equipment,
        exercises,
        startAt,
        endAt,
        goals,
        points,
      } = req.body;

      const gymId = req.params.id;

      if (
        !name ||
        !description ||
        !difficulty ||
        !duration?.value ||
        !duration?.unit
      ) {
        return res.status(400).json({
          message: "Champs obligatoires manquants",
        });
      }

      const gym: Gym | null = await this.gymService.findById(gymId);
      if (!gym) {
        return res.status(404).json({ message: "Salle introuvable" });
      }

      const challengeData: Partial<Challenge> = {
        name,
        description,
        difficulty,
        duration: {
          value: duration.value,
          unit: duration.unit,
        },
        gymId: gym._id,
        createdBy: gym.ownerId,
      };

      if (points !== undefined) challengeData.points = points;
      if (equipment?.length) challengeData.equipment = equipment;
      if (exercises?.length) challengeData.exercises = exercises;
      if (startAt) challengeData.startAt = startAt;
      if (endAt) challengeData.endAt = endAt;
      if (goals) challengeData.goals = goals;

      const createdChallenge = await this.challengeService.createChallenge(
        challengeData
      );

      return res.status(201).json({
        message: "Défi créé avec succès",
        challenge: createdChallenge,
      });
    } catch (err) {
      return res.status(400).json({
        message: "Erreur de création du défi",
        error: err,
      });
    }
  }

  async getChallenges(req: Request, res: Response) {
    try {
      const gymId = req.params.id;
      const gym: Gym | null = await this.gymService.findById(gymId);
      if (!gym) {
        return res.status(404).json({ message: "Salle introuvable" });
      }
      const Challenges = await this.challengeService.getChallenge(gym._id);
      if (!Challenges) {
        return res.status(404).json({ message: "Aucun défi n'est disponible" });
      }
      res.status(201).json(Challenges);
    } catch (err) {
      return res.status(400).json({
        message: "Erreur de la récupération des défis",
        error: err,
      });
    }
  }

  async getActiveChallenge(req: Request, res: Response) {
    try {
      const gymId = req.params.id;
      const gym: Gym | null = await this.gymService.findById(gymId);
      if (!gym) {
        return res.status(404).json({ message: "Salle introuvable" });
      }
      const Challenges = await this.challengeService.getActiveChallenge(
        gym._id
      );
      if (!Challenges) {
        return res.status(404).json({ message: "Aucun défi n'est disponible" });
      }
      res.status(201).json(Challenges);
    } catch (err) {
      return res.status(400).json({
        message: "Erreur de la récupération des défis",
        error: err,
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { gymId, challengeId } = req.params;
      const gym: Gym | null = await this.gymService.findById(gymId);
      if (!gym) {
        return res.status(404).json({ message: "Salle introuvable" });
      }
      const challenge = await this.challengeService.getChallengeById(
        challengeId
      );
      console.log("1", challenge);
      if (!challenge) {
        return res.status(404).json({ message: "Défi introuvable" });
      }
      if (challenge?.gymId?.toString() !== gym?._id?.toString()) {
        return res
          .status(403)
          .json({ message: "Le défi n'appartient pas à cette salle" });
      }
      const ChallengeUpdated = await this.challengeService.updateChallenge(
        challengeId,
        req.body
      );
      console.log("2", ChallengeUpdated);
      if (!ChallengeUpdated)
        return res.status(404).json({ message: "Défi introuvable" });
      res.json(ChallengeUpdated);
    } catch (err) {
      res
        .status(400)
        .json({ message: "Erreur modification exercice", error: err });
    }
  }

  async deleteChallenge(req: Request, res: Response) {
    try {
      const { gymId, challengeId } = req.params;
      const gym: Gym | null = await this.gymService.findById(gymId);
      if (!gym) {
        return res.status(404).json({ message: "Salle introuvable" });
      }
      const challenge = await this.challengeService.getChallengeById(
        challengeId
      );
      if (!challenge) {
        return res.status(404).json({ message: "Défi introuvable" });
      }
      if (challenge?.gymId?.toString() !== gym?._id?.toString()) {
        return res
          .status(403)
          .json({ message: "Le défi n'appartient pas à cette salle" });
      }
      const success = await this.challengeService.deleteChallenge(challengeId);
      if (!success) {
        return res.status(404).json({ message: "Défi non trouvée" });
      }
      res.status(204).send("Defi supprimée");
    } catch (err) {
      res
        .status(500)
        .json({ message: "Erreur lors de la suppression du défi", error: err });
    }
  }

  async getChallenge(req: Request, res: Response) {
    try {
      const { gymId, challengeId } = req.params;
      const gym: Gym | null = await this.gymService.findById(gymId);
      if (!gym) {
        return res.status(404).json({ message: "Salle introuvable" });
      }
      const challenge = await this.challengeService.getChallengeById(
        challengeId
      );
      if (!challenge) {
        return res.status(404).json({ message: "Défi introuvable" });
      }
      if (challenge?.gymId?.toString() !== gym?._id?.toString()) {
        return res
          .status(403)
          .json({ message: "Le défi n'appartient pas à cette salle" });
      }
      res.status(201).json(challenge);
    } catch (err) {
      return res.status(400).json({
        message: "Erreur de la récupération des défis",
        error: err,
      });
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

    router.get(
      "/challenge/:id",
      authMiddleware,
      requireRole(UserRole.OWNER),
      this.getChallenges.bind(this)
    );

    router.get(
      "/challenge/:gymId/:challengeId",
      authMiddleware,
      requireRole(UserRole.OWNER),
      this.getChallenge.bind(this)
    );

    router.get(
      "/activeChallenge/:id",
      authMiddleware,
      requireRole(UserRole.OWNER),
      this.getActiveChallenge.bind(this)
    );

    router.delete(
      "/removeChallenge/:gymId/:challengeId",
      authMiddleware,
      requireRole(UserRole.OWNER),
      this.deleteChallenge.bind(this)
    );

    router.put(
      "/updateChallenge/:gymId/:challengeId",
      authMiddleware,
      requireRole(UserRole.OWNER),
      this.update.bind(this)
    );

    return router;
  }
}
