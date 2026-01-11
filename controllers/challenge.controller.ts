import { Types } from "mongoose";
import { Router, Request, Response } from "express";
import {
  GymService,
  ChallengeService,
  UserChallengeService,
  SharedChallengeService,
} from "../services/mongoose/services/";
import { authMiddleware, requireRole } from "../utils/middlewares";
import { UserRole } from "../models/user.interface";
import { Gym, Challenge } from "../models";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

export class ChallengeController {
  constructor(
    private gymService: GymService,
    private challengeService: ChallengeService,
    private userChallengeService: UserChallengeService,
    private sharedChallengeService: SharedChallengeService
  ) { }

  async create(req: Request, res: Response) {
    try {
      const challengeData = {
        ...req.body,
        createdBy: req.user!.userId,
        // Auto-approuver si ADMIN ou OWNER
        isApproved: req.user!.role === UserRole.ADMIN || req.user!.role === UserRole.OWNER
      };

      const challenge = await this.challengeService.createChallenge(challengeData);

      res.status(201).json({
        message: challengeData.isApproved
          ? "Défi créé et approuvé automatiquement"
          : "Défi créé, en attente d'approbation",
        challenge
      });
    } catch (err: any) {
      res.status(400).json({
        message: "Erreur création défi",
        error: err.message
      });
    }
  }


  // Défis approuvés (public)
  async getApproved(req: Request, res: Response) {
    try {
      const challenges = await this.challengeService.findApprovedChallenges();
      res.json(challenges);
    } catch (err: any) {
      res.status(500).json({
        message: "Erreur récupération défis",
        error: err.message
      });
    }
  }

  // Détail d'un défi
  async getById(req: Request, res: Response) {
    try {
      const challenge = await this.challengeService.findById(req.params.id);
      if (!challenge) {
        return res.status(404).json({ message: "Défi introuvable" });
      }
      res.json(challenge);
    } catch (err: any) {
      res.status(400).json({
        message: "Erreur récupération défi",
        error: err.message
      });
    }
  }

  // Défis par salle (public)
  async getByGym(req: Request, res: Response) {
    try {
      const challenges = await this.challengeService.findByGym(req.params.gymId);
      res.json(challenges);
    } catch (err: any) {
      res.status(500).json({
        message: "Erreur récupération défis",
        error: err.message

      })
    }
  }

  // Défis actifs pour une salle (Owner)
  async getActiveChallenge(req: Request, res: Response) {
    try {
      const gymId = req.params.id;
      const gym: Gym | null = await this.gymService.findById(gymId);
      if (!gym) {
        return res.status(404).json({ message: "Salle introuvable" });
      }
      const Challenges = await this.challengeService.getActiveChallengeOwner(
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
      })
    }
  };

  //  Approuver un défi Admin/Owner uniquement
  async approve(req: Request, res: Response) {
    try {
      const challenge = await this.challengeService.approveChallenge(req.params.id);
      if (!challenge) {
        return res.status(404).json({ message: "Défi introuvable" });
      }
      res.json({ message: "Défi approuvé", challenge });
    } catch (err: any) {
      res.status(400).json({
        message: "Erreur approbation défi",
        error: err.message
      });
    }
  }

  // Mettre à jour un défi Propriétaire/Administrateur uniquement
  async updateOwner(req: Request, res: Response) {
    try {
      const challenge = await this.challengeService.findById(req.params.id);

      if (!challenge) {
        return res.status(404).json({ message: "Défi introuvable" });
      }

      // Vérifier permissions
      if (challenge.createdBy.toString() !== req.user!.userId && req.user!.role !== UserRole.ADMIN || req.user!.role !== UserRole.OWNER) {
        return res.status(403).json({
          message: "Vous n'êtes pas autorisé à modifier ce défi"
        });
      }

      const updated = await this.challengeService.updateChallenge(req.params.id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({
        message: "Erreur modification défi",
        error: err.message
      });
    }
  }
// Mettre à jour un défi (client)
  async updateCustomer(req: Request, res: Response) {
    try {
      const challenge = await this.challengeService.findById(req.params.id);

      if (!challenge) {
        return res.status(404).json({ message: "Défi introuvable" });
      }

      // Vérifier permissions
      if (challenge.createdBy.toString() !== req.user!.userId) {
        return res.status(403).json({
          message: "Vous n'êtes pas autorisé à modifier ce défi"
        });
      }
      const updated = await this.challengeService.updateChallenge(req.params.id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({
        message: "Erreur modification défi",
        error: err.message
      });
    }
  }

  // Supprimer un défi
  async delete(req: Request, res: Response) {
    try {
      const challenge = await this.challengeService.findById(req.params.id);

      if (!challenge) {
        return res.status(404).json({ message: "Défi introuvable" });
      }

      // Vérifier permissions
      if (challenge.createdBy.toString() !== req.user!.userId) {
        return res.status(403).json({
          message: "Vous n'êtes pas autorisé à supprimer ce défi"
        });
      }

      await this.challengeService.deleteChallenge(req.params.id);
      res.status(204).end();
    } catch (err: any) {
      res.status(500).json({
        message: "Erreur suppression défi",
        error: err.message
      });
    }
  }

  // Rejoindre un défi
  async join(req: Request, res: Response) {
    try {
      const participation = await this.userChallengeService.joinChallenge(
        req.user!.userId,
        req.params.id
      );

      res.status(201).json({
        message: "Vous avez rejoint le défi",
        participation
      });
    } catch (err: any) {
      res.status(400).json({
        message: err.message
      });
    }
  }

  // Terminer un défi
  async complete(req: Request, res: Response) {
    try {
      const challenge = await this.challengeService.findById(req.params.id);
      if (!challenge) {
        return res.status(404).json({ message: "Défi introuvable" });
      }

      const participation = await this.userChallengeService.completeChallenge(
        req.user!.userId,
        req.params.id,
        challenge.points ?? 0
      );

      if (!participation) {
        return res.status(404).json({ message: "Vous ne participez pas à ce défi" });
      }

      res.json({
        message: "Défi terminé ! Félicitations !",
        pointsEarned: challenge.points,
        participation
      });
    } catch (err: any) {
      res.status(400).json({
        message: "Erreur pour terminer le défi",
        error: err.message
      });
    }
  }

  // Quitter un défi
  async leave(req: Request, res: Response) {
    try {
      const success = await this.userChallengeService.leaveChallenge(
        req.user!.userId,
        req.params.id
      );

      if (!success) {
        return res.status(404).json({ message: "Vous ne participez pas à ce défi" });
      }

      res.json({ message: "Vous avez quitté le défi" });
    } catch (err: any) {
      res.status(400).json({
        message: "Erreur pour quitter le défi",
        error: err.message
      });
    }
  }

  // Mes défis en cours CLIENTS
  async getMyActiveChallenges(req: Request, res: Response) {
    try {
      const challenges = await this.userChallengeService.findActiveChallenges(req.user!.userId);
      res.json(challenges);
    } catch (err: any) {
      res.status(500).json({
        message: "Erreur récupération défis",
        error: err.message
      });
    }
  }

  // Mes défis complétés CLIENTS
  async getMyCompletedChallenges(req: Request, res: Response) {
    try {
      const challenges = await this.userChallengeService.findCompletedChallenges(req.user!.userId);
      res.json(challenges);
    } catch (err: any) {
      res.status(500).json({
        message: "Erreur récupération défis",
        error: err.message
      });
    }
  }

  // Mes points 
  async getMyPoints(req: Request, res: Response) {
    try {
      const totalPoints = await this.userChallengeService.getUserTotalPoints(req.user!.userId);
      res.json({ totalPoints });
    } catch (err: any) {
      res.status(500).json({
        message: "Erreur calcul points",
        error: err.message
      });
    }
  }


  async share(req: Request, res: Response) {
    try {
      const { sharedWith } = req.body;

      if (!Array.isArray(sharedWith) || sharedWith.length === 0) {
        return res.status(400).json({
          message: "Veuillez fournir une liste d'utilisateurs"
        });
      }

      const share = await this.sharedChallengeService.shareChallenge(
        req.params.id,
        req.user!.userId,
        sharedWith
      );

      res.status(201).json({
        message: "Défi partagé avec succès",
        share
      });
    } catch (err: any) {
      res.status(400).json({
        message: "Erreur partage défi",
        error: err.message
      });
    }
  }

  // Défis partagés avec moi
  async getSharedWithMe(req: Request, res: Response) {
    try {
      const challenges = await this.sharedChallengeService.findSharedWithUser(req.user!.userId);
      res.json(challenges);
    } catch (err: any) {
      res.status(500).json({
        message: "Erreur récupération défis partagés",
        error: err.message

      }
      );
    }
  }

  // Supprimer un défi propriétaire
  async deleteChallengeOwner(req: Request, res: Response) {
    try {
      const { gymId, challengeId } = req.params;
      const gym: Gym | null = await this.gymService.findById(gymId);
      if (!gym) {
        return res.status(404).json({ message: "Salle introuvable" });
      }
      const challenge = await this.challengeService.getChallengeByIdOwner(
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

  // Récupérer un défi propriétaire
  async getChallengeOwner(req: Request, res: Response) {
    try {
      const { gymId, challengeId } = req.params;
      const gym: Gym | null = await this.gymService.findById(gymId);
      if (!gym) {
        return res.status(404).json({ message: "Salle introuvable" });
      }
      const challenge = await this.challengeService.getChallengeByIdOwner(
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

  // Récupérer les défis d'une salle propriétaire
  async getChallenges(req: Request, res: Response) {
    try {
      const gymId = req.params.id;
      const gym: Gym | null = await this.gymService.findById(gymId);
      if (!gym) {
        return res.status(404).json({ message: "Salle introuvable" });
      }
      const Challenges = await this.challengeService.getChallengeOwner(gym._id);
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

  buildRouter(): Router {
    const router = Router();

    // Routes publiques/authentifiées
    router.get('/approved', authMiddleware, this.getApproved.bind(this));
    router.get('/gym/:gymId', authMiddleware, this.getByGym.bind(this));

    // Routes personnelles (/me/...)
    router.get('/me/participating', authMiddleware, this.getMyActiveChallenges.bind(this));
    router.get('/me/completed', authMiddleware, this.getMyCompletedChallenges.bind(this));
    router.get('/me/points', authMiddleware, this.getMyPoints.bind(this));

    // Routes de partage
    router.get('/shared/with-me', authMiddleware, this.getSharedWithMe.bind(this));

    // Lecture
     router.get(
      "/activeChallenge/:id",
      authMiddleware,
      requireRole(UserRole.OWNER),
      this.getActiveChallenge.bind(this)
    );

    // Propriétaire/Administrateur uniquement
    router.get(
      "/owner/:id/challenges",
      authMiddleware,
      requireRole(UserRole.OWNER),
      this.getChallenges.bind(this)
    );

    router.get(
      "/owner/:gymId/challenges/:challengeId",
      authMiddleware,
      requireRole(UserRole.OWNER),
      this.getChallengeOwner.bind(this)
    );

    router.patch('/approve/:id', authMiddleware, requireRole(UserRole.ADMIN, UserRole.OWNER), this.approve.bind(this));

    // Routes avec ID
    // Lecture
    router.get('/:id', authMiddleware, this.getById.bind(this));
   
    // Actions utilisateur
    router.post('/:id/join', authMiddleware, this.join.bind(this));
    router.post('/:id/complete', authMiddleware, this.complete.bind(this));
    router.delete('/:id/leave', authMiddleware, this.leave.bind(this));
    router.post('/:id/share', authMiddleware, this.share.bind(this));

    router.post('/', authMiddleware, this.create.bind(this));

    // Modification 
    router.put('/:id', authMiddleware, requireRole(UserRole.OWNER), this.updateOwner.bind(this));
    router.patch('/:id', authMiddleware, this.updateCustomer.bind(this));

    router.delete('/:id', authMiddleware, this.delete.bind(this));

    return router;
  }
}


