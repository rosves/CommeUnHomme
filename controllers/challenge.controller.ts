import { Gym } from "../models";
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

export class ChallengeController {
  constructor(
    private gymService: GymService,
    private challengeService: ChallengeService,
    private userChallengeService: UserChallengeService,
    private sharedChallengeService: SharedChallengeService
  ) {}

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
    });}}
  

  // GET /challenge/approved - Défis approuvés (public)
  
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

// GET /challenge/:id - Détail d'un défi
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

  async getByGym(req: Request, res: Response) {
    try {
      const challenges = await this.challengeService.findByGym(req.params.gymId);
      res.json(challenges);
    } catch (err: any) {
      res.status(500).json({ 
        message: "Erreur récupération défis", 
        error: err.message 
      });
    }
  }

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

  async update(req: Request, res: Response) {
    try {
      const challenge = await this.challengeService.findById(req.params.id);
      
      if (!challenge) {
        return res.status(404).json({ message: "Défi introuvable" });
      }

      // Vérifier permissions
      if (challenge.createdBy.toString() !== req.user!.userId && req.user!.role !== UserRole.ADMIN) {
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

  
  async delete(req: Request, res: Response) {
    try {
      const challenge = await this.challengeService.findById(req.params.id);
      
      if (!challenge) {
        return res.status(404).json({ message: "Défi introuvable" });
      }

      // Vérifier permissions
      if (challenge.createdBy.toString() !== req.user!.userId && req.user!.role !== UserRole.ADMIN) {
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

  // GET /challenge/me/participating - Mes défis en cours CLIENTS
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
  // GET /challenge/me/completed - Mes défis complétés CLIENTS
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

  async getSharedWithMe(req: Request, res: Response) {
    try {
      const challenges = await this.sharedChallengeService.findSharedWithUser(req.user!.userId);
      res.json(challenges);
    } catch (err: any) {
      res.status(500).json({ 
        message: "Erreur récupération défis partagés", 
        error: err.message 
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
    
    // Routes avec ID de défi
    // Lecture
    router.get('/:id', authMiddleware, this.getById.bind(this));
    
    // Actions utilisateur
    router.post('/:id/join', authMiddleware, this.join.bind(this));
    router.post('/:id/complete', authMiddleware, this.complete.bind(this));
    router.delete('/:id/leave', authMiddleware, this.leave.bind(this));
    router.post('/:id/share', authMiddleware, this.share.bind(this));
    
    // Modification 
    router.put('/:id', authMiddleware, this.update.bind(this));
    router.delete('/:id', authMiddleware, this.delete.bind(this));
    
    // Administration 
    router.post('/', authMiddleware, this.create.bind(this));
    //router.post('/gym/:gymId', authMiddleware, requireRole(UserRole.OWNER, UserRole.ADMIN), this.createForGym.bind(this));
    router.patch('/approve/:id', authMiddleware, requireRole(UserRole.ADMIN, UserRole.OWNER), this.approve.bind(this));
    
    
    return router;
  }
}
