import { Router, Request, Response } from "express";
import { GymService } from "../services/mongoose/services/gym.service";
import { authMiddleware, requireRole } from "../utils/middlewares";
import { UserRole } from "../models/user.interface";

export class GymController {
  constructor(private gymService: GymService) {}

  async create(req: Request, res: Response) {
    try {
      const userRole = (req.headers["x-role"] as string) || "user";

      const gym = await this.gymService.createGym(req.body, userRole);
      res.status(201).json(gym);
    } catch (err) {
      res
        .status(400)
        .json({ message: "Erreur lors de la création", error: err });
    }
  }

  async addOwner(req: Request, res: Response) {
    try {
      const ownerToAdd = req.body.user;
      this.gymService.addOwner(ownerToAdd);
    } catch (err) {
      res.status(400).json({
        message: "Erreur lors de l'ajout d'un proproétaire",
        error: err,
      });
    }
  }

  async approve(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const approvedGym = await this.gymService.approve(id);
      if (!approvedGym) {
        return res.status(404).json({ message: "Salle introuvable" });
      }
      res.json(approvedGym);
    } catch (err) {
      res
        .status(400)
        .json({ message: "Erreur lors de l'approbation", error: err });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const gym = await this.gymService.updateGym(req.params.id, req.body);
      if (!gym) {
        return res
          .status(404)
          .json({ message: "Salle introuvable pour modification" });
      }
      res.json(gym);
    } catch (err) {
      res
        .status(400)
        .json({ message: "Erreur lors de la modification", error: err });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const success = await this.gymService.deleteGym(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Salle non trouvée" });
      }
      res.status(204).send();
    } catch (err) {
      res
        .status(500)
        .json({ message: "Erreur lors de la suppression", error: err });
    }
  }

  async getApprovedGyms(req: Request, res: Response) {
    const gyms = await this.gymService.findApprovedGyms();
    res.json(gyms);
  }

  async getAll(req: Request, res: Response) {
    const gyms = await this.gymService.findAll();
    res.json(gyms);
  }

  async getById(req: Request, res: Response) {
    try {
      const gym = await this.gymService.findById(req.params.id);
      if (!gym) {
        return res.status(404).json({ message: "Salle introuvable" });
      }
      res.json(gym);
    } catch (err) {
      res
        .status(400)
        .json({ message: "ID invalide ou erreur serveur", error: err });
    }
  }

  buildRouter(): Router {
    const router = Router();

    // Publiques
    router.get("/all", this.getApprovedGyms.bind(this));
    router.get("/:id", this.getById.bind(this));
    // Protégés
    router.post("/addOwner", authMiddleware, this.create.bind(this));
    router.post("/", authMiddleware, this.create.bind(this));
    router.put("/:id", authMiddleware, this.update.bind(this));
    router.delete("/:id", authMiddleware, this.delete.bind(this));
    // Admin
    router.get(
      "/admin/all",
      authMiddleware,
      requireRole(UserRole.ADMIN),
      this.getAll.bind(this)
    );
    router.patch(
      "/approve/:id",
      authMiddleware,
      requireRole(UserRole.ADMIN),
      this.approve.bind(this)
    );

    return router;
  }
}
