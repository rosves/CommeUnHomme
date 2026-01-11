import { BadgeModel, UserBadgeModel } from "../schema";
import { Badge, UserBadge, BadgeRule } from "../../../models/badge";
import { Types } from "mongoose";

export class BadgeService {
  /**
   * Créer un nouveau badge avec règles
   */
  async createBadge(badgeData: Badge, userId: string): Promise<Badge> {
    const badge = new BadgeModel({
      ...badgeData,
      createdBy: new Types.ObjectId(userId),
      isActive: true,
    });
    return await badge.save();
  }

  /**
   * Récupérer tous les badges actifs
   */
  async getAllBadges(): Promise<Badge[]> {
    return await BadgeModel.find({ isActive: true })
      .populate("createdBy", "firstname lastname")
      .exec();
  }

  /**
   * Récupérer tous les badges (actifs et archivés)
   */
  async getAllBadgesIncludeArchived(): Promise<Badge[]> {
    return await BadgeModel.find()
      .populate("createdBy", "firstname lastname")
      .exec();
  }

  /**
   * Récupérer un badge par ID
   */
  async getBadgeById(badgeId: string): Promise<Badge | null> {
    return await BadgeModel.findById(badgeId)
      .populate("createdBy", "firstname lastname")
      .exec();
  }

  /**
   * Mettre à jour un badge
   */
  async updateBadge(badgeId: string, updateData: Partial<Badge>): Promise<Badge | null> {
    return await BadgeModel.findByIdAndUpdate(badgeId, updateData, { new: true })
      .populate("createdBy", "firstname lastname")
      .exec();
  }

  /**
   * Supprimer un badge (soft delete - archivage)
   */
  async deleteBadge(badgeId: string): Promise<boolean> {
    const result = await BadgeModel.findByIdAndUpdate(
      badgeId,
      { isActive: false },
      { new: true }
    );
    return !!result;
  }

  /**
   * Archiver/Désarchiver un badge
   */
  async toggleBadgeStatus(badgeId: string): Promise<Badge | null> {
    const badge = await BadgeModel.findById(badgeId);
    if (!badge) return null;

    return await BadgeModel.findByIdAndUpdate(
      badgeId,
      { isActive: !badge.isActive },
      { new: true }
    )
      .populate("createdBy", "firstname lastname")
      .exec();
  }

  /**
   * Assigner un badge à un utilisateur avec raison
   */
  async assignBadgeToUser(
    userId: string,
    badgeId: string,
    earnedFrom?: {
      challengeId?: string;
      points?: number;
      reason?: string;
    }
  ): Promise<UserBadge> {
    const badge = await BadgeModel.findById(badgeId);
    if (!badge) {
      throw new Error("Badge non trouvé");
    }

    // Vérifier les limites maxEarnings
    if (badge.maxEarnings && badge.maxEarnings !== -1) {
      const earnedCount = await UserBadgeModel.countDocuments({
        userId: new Types.ObjectId(userId),
        badgeId: new Types.ObjectId(badgeId),
      });

      if (earnedCount >= badge.maxEarnings) {
        throw new Error("Limite d'obtention du badge atteinte");
      }
    }

    const userBadge = new UserBadgeModel({
      userId: new Types.ObjectId(userId),
      badgeId: new Types.ObjectId(badgeId),
      earnedAt: new Date(),
      earnedCount: 1,
      earnedFrom: earnedFrom && {
        challengeId: earnedFrom.challengeId ? new Types.ObjectId(earnedFrom.challengeId) : undefined,
        points: earnedFrom.points,
        reason: earnedFrom.reason,
      },
    });

    return await userBadge.save();
  }

  /**
   * Retirer un badge d'un utilisateur
   */
  async removeBadgeFromUser(userId: string, badgeId: string): Promise<boolean> {
    const result = await UserBadgeModel.findOneAndDelete({
      userId: new Types.ObjectId(userId),
      badgeId: new Types.ObjectId(badgeId),
    });
    return !!result;
  }

  /**
   * Récupérer tous les badges d'un utilisateur
   */
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return await UserBadgeModel.find({ userId: new Types.ObjectId(userId) })
      .populate("badgeId")
      .populate("earnedFrom.challengeId")
      .exec();
  }

  /**
   * Compter les badges d'un utilisateur
   */
  async getUserBadgeCount(userId: string): Promise<number> {
    return await UserBadgeModel.countDocuments({
      userId: new Types.ObjectId(userId),
    });
  }

  /**
   * Vérifier si un utilisateur a un badge spécifique
   */
  async userHasBadge(userId: string, badgeId: string): Promise<boolean> {
    const badge = await UserBadgeModel.findOne({
      userId: new Types.ObjectId(userId),
      badgeId: new Types.ObjectId(badgeId),
    });
    return !!badge;
  }
}
