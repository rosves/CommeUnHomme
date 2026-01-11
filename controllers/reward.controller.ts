import { Router, Request, Response } from "express";
import { RewardService } from "../services/mongoose/services";
import { authMiddleware, requireRole } from "../utils/middlewares";
import { Reward, RewardType, UserRole } from "../models";

export class RewardController {
  constructor(private rewardService: RewardService) {}

  async create(req: Request, res: Response) {
    try {
      const { name, description, pointsCost, type, value, validUntil, maxClaims, gymId } =
        req.body;
      const userId = req.headers["user-id"] as string;

      if (!name || !description || !pointsCost || !type) {
        return res.status(400).json({
          message:
            "Les champs name, description, pointsCost et type sont obligatoires",
        });
      }

      const reward = await this.rewardService.createReward(
        {
          name,
          description,
          pointsCost,
          type,
          details: value,
          validUntil,
          maxClaims: maxClaims || -1,
          gymId,
          isActive: true,
        } as Reward,
        userId
      );

      res.status(201).json(reward);
    } catch (err: any) {
      res.status(400).json({
        message: "Erreur lors de la création de la récompense",
        error: err.message,
      });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const rewards = await this.rewardService.getAllRewards();
      res.json(rewards);
    } catch (err: any) {
      res.status(500).json({
        message: "Erreur lors de la récupération des récompenses",
        error: err.message,
      });
    }
  }

  async getAvailable(req: Request, res: Response) {
    try {
      const rewards = await this.rewardService.getAvailableRewards();
      res.json(rewards);
    } catch (err: any) {
      res.status(500).json({
        message: "Erreur lors de la récupération des récompenses",
        error: err.message,
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const reward = await this.rewardService.getRewardById(id);

      if (!reward) {
        return res.status(404).json({ message: "Récompense introuvable" });
      }

      res.json(reward);
    } catch (err: any) {
      res.status(400).json({
        message: "Erreur lors de la récupération de la récompense",
        error: err.message,
      });
    }
  }

  async getByType(req: Request, res: Response) {
    try {
      const { type } = req.params;
      const rewards = await this.rewardService.getRewardsByType(type as RewardType);
      res.json(rewards);
    } catch (err: any) {
      res.status(500).json({
        message: "Erreur lors de la récupération des récompenses",
        error: err.message,
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, pointsCost, type, value, validUntil, maxClaims, gymId } =
        req.body;

      const reward = await this.rewardService.updateReward(id, {
        name,
        description,
        pointsCost,
        type,
        details: value,
        validUntil,
        maxClaims,
        gymId,
      } as Partial<Reward>);

      if (!reward) {
        return res.status(404).json({ message: "Récompense introuvable" });
      }

      res.json(reward);
    } catch (err: any) {
      res.status(400).json({
        message: "Erreur lors de la modification de la récompense",
        error: err.message,
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = await this.rewardService.deleteReward(id);

      if (!success) {
        return res.status(404).json({ message: "Récompense introuvable" });
      }

      res.status(204).send();
    } catch (err: any) {
      res.status(500).json({
        message: "Erreur lors de la suppression de la récompense",
        error: err.message,
      });
    }
  }

  async claimReward(req: Request, res: Response) {
    try {
      const { rewardId } = req.params;
      const { challengeId, totalPoints } = req.body;
      const userId = req.headers["user-id"] as string;

      if (!userId || !rewardId) {
        return res.status(400).json({
          message: "userId et rewardId sont obligatoires",
        });
      }

      const userReward = await this.rewardService.claimReward(userId, rewardId, {
        challengeId,
        totalPoints,
      });
      res.status(201).json(userReward);
    } catch (err: any) {
      res.status(400).json({
        message: "Erreur lors de la réclamation de la récompense",
        error: err.message,
      });
    }
  }

  async getUserRewards(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const rewards = await this.rewardService.getUserRewards(userId);
      res.json(rewards);
    } catch (err: any) {
      res.status(500).json({
        message: "Erreur lors de la récupération des récompenses de l'utilisateur",
        error: err.message,
      });
    }
  }

  async getUnclaimedRewards(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const rewards = await this.rewardService.getUnclaimedRewards(userId);
      res.json(rewards);
    } catch (err: any) {
      res.status(500).json({
        message: "Erreur lors de la récupération des récompenses",
        error: err.message,
      });
    }
  }

  async useReward(req: Request, res: Response) {
    try {
      const { userRewardId } = req.params;
      const reward = await this.rewardService.useReward(userRewardId);

      if (!reward) {
        return res.status(404).json({ message: "Récompense utilisateur introuvable" });
      }

      res.json(reward);
    } catch (err: any) {
      res.status(400).json({
        message: "Erreur lors de l'utilisation de la récompense",
        error: err.message,
      });
    }
  }

  buildRouter(): Router {
    const router = Router();

    // Publiques
    router.get("/all", this.getAll.bind(this));
    router.get("/available", this.getAvailable.bind(this));
    router.get("/type/:type", this.getByType.bind(this));
    router.get("/:id", this.getById.bind(this));

    // Protégés
    router.post("/claim/:rewardId", authMiddleware, this.claimReward.bind(this));
    router.get("/user/:userId", authMiddleware, this.getUserRewards.bind(this));
    router.get("/user/:userId/unclaimed", authMiddleware, this.getUnclaimedRewards.bind(this));
    router.patch("/use/:userRewardId", authMiddleware, this.useReward.bind(this));

    // Admin seulement
    router.post("/", authMiddleware, requireRole(UserRole.ADMIN), this.create.bind(this));
    router.put("/:id", authMiddleware, requireRole(UserRole.ADMIN), this.update.bind(this));
    router.delete("/:id", authMiddleware, requireRole(UserRole.ADMIN), this.delete.bind(this));

    return router;
  }
}
