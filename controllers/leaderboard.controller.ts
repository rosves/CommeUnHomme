import { Router, Request, Response } from "express";
import { LeaderboardService } from "../services/mongoose/services";
import { authMiddleware } from "../utils/middlewares";

export class LeaderboardController {
  constructor(private leaderboardService: LeaderboardService) {}

  async getTopByPoints(req: Request, res: Response) {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      const leaderboard = await this.leaderboardService.getTopByPoints(limit);

      res.json({
        title: "🏆 Top Utilisateurs par Points",
        leaderboard,
      });
    } catch (err: any) {
      res.status(500).json({
        message: "Erreur lors de la récupération du classement",
        error: err.message,
      });
    }
  }

  async getTopByChallenges(req: Request, res: Response) {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      const leaderboard =
        await this.leaderboardService.getTopByChallenges(limit);

      res.json({
        title: "🎯 Top Utilisateurs par Défis Complétés",
        leaderboard,
      });
    } catch (err: any) {
      res.status(500).json({
        message: "Erreur lors de la récupération du classement",
        error: err.message,
      });
    }
  }

  async getMostActive(req: Request, res: Response) {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      const leaderboard = await this.leaderboardService.getMostActive(limit);

      res.json({
        title: "🔥 Utilisateurs les Plus Actifs",
        leaderboard,
      });
    } catch (err: any) {
      res.status(500).json({
        message: "Erreur lors de la récupération du classement",
        error: err.message,
      });
    }
  }

  async getUserRank(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const userRank = await this.leaderboardService.getUserRank(userId);

      if (!userRank) {
        return res.status(404).json({
          message: "Cet utilisateur n'a pas encore participé aux défis",
        });
      }

      res.json(userRank);
    } catch (err: any) {
      res.status(500).json({
        message: "Erreur lors de la récupération du rang",
        error: err.message,
      });
    }
  }

  async getMyRank(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const userRank = await this.leaderboardService.getUserRank(userId);

      if (!userRank) {
        return res.json({
          message: "Vous n'avez pas encore participé aux défis",
          rank: null,
        });
      }

      res.json(userRank);
    } catch (err: any) {
      res.status(500).json({
        message: "Erreur lors de la récupération de votre rang",
        error: err.message,
      });
    }
  }

  buildRouter(): Router {
    const router = Router();

    router.get("/top-points", this.getTopByPoints.bind(this));
    router.get("/top-challenges", this.getTopByChallenges.bind(this));
    router.get("/most-active", this.getMostActive.bind(this));
    router.get("/user/:userId", this.getUserRank.bind(this));

    router.get("/me/rank", authMiddleware, this.getMyRank.bind(this));

    return router;
  }
}
