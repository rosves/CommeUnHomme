import { Router, Request, Response } from "express";
import { GymService, UserService } from "../services/mongoose/services/";
import { authMiddleware, requireRole } from "../utils/middlewares";
import { UserRole } from "../models/user.interface";
import { Gym } from "../models";

export class GymController {
  constructor(
    private gymService: GymService,
    private userService: UserService
  ) {}

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

  async changeInfo(req: Request, res: Response) {
    try {
      if (!req.params.id) {
        res.status(400).send("Veuillez précise l'id");
      }

      const Gym = await this.gymService.findById(req.params.id);
      const Data: Record<string, any> = {};

      for (const key in req.body) {
        const value = req.body[key];

        if (
          // Pour checker si c'est un sous-object
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          for (const subKey in value) {
            Data[`${key}.${subKey}`] = value[subKey];
          }
        } else {
          // champs simples
          Data[key] = value;
        }
      }

      if (!Gym) {
        res.status(400).send("La salle n'existe pas");
      }

      const GymModified = await this.gymService.changeInformation(
        req.params.id,
        Data
      );

      if (!GymModified) {
        res.status(400).send("Erreur de modification");
      }

      res.status(200).json({
        message: "Les informations de la salle on été mis à jour", 
        gym: GymModified,
      });
    } catch (err) {
      res.status(400).json({
        message: "Erreur lors de l'ajout d'un propriétaire",
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
    router.post("/", authMiddleware, this.create.bind(this));
    router.put("/:id", authMiddleware, this.update.bind(this));
    router.delete("/:id", authMiddleware, this.delete.bind(this));

    // Owner
    router.post("/changeInfo/:id", authMiddleware, this.changeInfo.bind(this));

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
