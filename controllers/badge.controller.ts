import { Router, Request, Response } from "express";
import { BadgeService } from "../services/mongoose/services";
import { authMiddleware, requireRole } from "../utils/middlewares";
import { Badge, UserRole } from "../models";

export class BadgeController {
  constructor(private badgeService: BadgeService) {}

  async create(req: Request, res: Response) {
    try {
      const { name, description, rules, maxEarnings } = req.body;
      const userId = req.headers["user-id"] as string;

      if (!name || !description) {
        return res.status(400).json({
          message: "Les champs name et description sont obligatoires",
        });
      }

      const badge = await this.badgeService.createBadge(
        {
          name,
          description,
          rules,
          maxEarnings: maxEarnings || 1,
          isActive: true,
        } as Badge,
        userId
      );

      res.status(201).json(badge);
    } catch (err: any) {
      res.status(400).json({
        message: "Erreur lors de la création du badge",
        error: err.message,
      });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const badges = await this.badgeService.getAllBadges();
      res.json(badges);
    } catch (err: any) {
      res.status(500).json({
        message: "Erreur lors de la récupération des badges",
        error: err.message,
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const badge = await this.badgeService.getBadgeById(id);

      if (!badge) {
        return res.status(404).json({ message: "Badge introuvable" });
      }

      res.json(badge);
    } catch (err: any) {
      res.status(400).json({
        message: "Erreur lors de la récupération du badge",
        error: err.message,
      });
    }
  }

  async getByType(req: Request, res: Response) {
    try {
      const { type } = req.params;
      const badges = await this.badgeService.getAllBadges();
      const filtered = badges.filter((b) => b.rules?.single?.type === type || 
                                              b.rules?.multiple?.rules.some((r: any) => r.type === type));
      res.json(filtered);
    } catch (err: any) {
      res.status(500).json({
        message: "Erreur lors de la récupération des badges",
        error: err.message,
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, rules, maxEarnings, isActive } = req.body;

      const badge = await this.badgeService.updateBadge(id, {
        name,
        description,
        rules,
        maxEarnings,
        isActive,
      } as Partial<Badge>);

      if (!badge) {
        return res.status(404).json({ message: "Badge introuvable" });
      }

      res.json(badge);
    } catch (err: any) {
      res.status(400).json({
        message: "Erreur lors de la modification du badge",
        error: err.message,
      });
    }
  }

  async toggleStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const badge = await this.badgeService.toggleBadgeStatus(id);

      if (!badge) {
        return res.status(404).json({ message: "Badge introuvable" });
      }

      res.json(badge);
    } catch (err: any) {
      res.status(500).json({
        message: "Erreur lors du changement de statut",
        error: err.message,
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = await this.badgeService.deleteBadge(id);

      if (!success) {
        return res.status(404).json({ message: "Badge introuvable" });
      }

      res.status(204).send();
    } catch (err: any) {
      res.status(500).json({
        message: "Erreur lors de la suppression du badge",
        error: err.message,
      });
    }
  }

  async assignToUser(req: Request, res: Response) {
    try {
      const { userId, badgeId } = req.params;
      const { challengeId, points } = req.body;

      if (!userId || !badgeId) {
        return res.status(400).json({
          message: "userId et badgeId sont obligatoires",
        });
      }

      const userBadge = await this.badgeService.assignBadgeToUser(userId, badgeId, {
        challengeId,
        points,
      });
      res.status(201).json(userBadge);
    } catch (err: any) {
      res.status(400).json({
        message: "Erreur lors de l'attribution du badge",
        error: err.message,
      });
    }
  }

  async removeFromUser(req: Request, res: Response) {
    try {
      const { userId, badgeId } = req.params;

      if (!userId || !badgeId) {
        return res.status(400).json({
          message: "userId et badgeId sont obligatoires",
        });
      }

      const removed = await this.badgeService.removeBadgeFromUser(userId, badgeId);
      if (!removed) {
        return res.status(404).json({ message: "Badge utilisateur non trouvé" });
      }

      res.json({ message: "Badge retiré avec succès" });
    } catch (err: any) {
      res.status(500).json({
        message: "Erreur lors de la suppression du badge",
        error: err.message,
      });
    }
  }

  async getUserBadges(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const userBadges = await this.badgeService.getUserBadges(userId);
      res.json(userBadges);
    } catch (err: any) {
      res.status(500).json({
        message: "Erreur lors de la récupération des badges",
        error: err.message,
      });
    }
  }

  buildRouter(): Router {
    const router = Router();

    // Publiques
    router.get("/all", this.getAll.bind(this));
    router.get("/type/:type", this.getByType.bind(this));
    router.get("/user/:userId", this.getUserBadges.bind(this));
    router.get("/:id", this.getById.bind(this));

    // Protégés - Admin seulement
    router.post("/", authMiddleware, requireRole(UserRole.ADMIN), this.create.bind(this));
    router.put("/:id", authMiddleware, requireRole(UserRole.ADMIN), this.update.bind(this));
    router.patch("/:id/toggle", authMiddleware, requireRole(UserRole.ADMIN), this.toggleStatus.bind(this));
    router.delete("/:id", authMiddleware, requireRole(UserRole.ADMIN), this.delete.bind(this));
    router.post("/:badgeId/assign/:userId", authMiddleware, requireRole(UserRole.ADMIN), this.assignToUser.bind(this));
    router.post("/:badgeId/remove/:userId", authMiddleware, requireRole(UserRole.ADMIN), this.removeFromUser.bind(this));

    return router;
  }
}
