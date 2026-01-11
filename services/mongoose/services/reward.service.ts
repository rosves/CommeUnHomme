import { RewardModel, UserRewardModel } from "../schema";
import { Reward, UserReward, RewardType } from "../../../models/reward";
import { Types } from "mongoose";

export class RewardService {
  /**
   * Créer une nouvelle récompense
   */
  async createReward(rewardData: Reward, userId: string): Promise<Reward> {
    const reward = new RewardModel({
      ...rewardData,
      createdBy: new Types.ObjectId(userId),
    });
    return await reward.save();
  }

  /**
   * Récupérer toutes les récompenses
   */
  async getAllRewards(): Promise<Reward[]> {
    return await RewardModel.find()
      .populate("createdBy", "firstname lastname")
      .populate("gymId", "name")
      .exec();
  }

  /**
   * Récupérer une récompense par ID
   */
  async getRewardById(rewardId: string): Promise<Reward | null> {
    return await RewardModel.findById(rewardId)
      .populate("createdBy", "firstname lastname")
      .populate("gymId", "name")
      .exec();
  }

  /**
   * Récupérer les récompenses par type
   */
  async getRewardsByType(type: RewardType): Promise<Reward[]> {
    return await RewardModel.find({ type })
      .populate("createdBy", "firstname lastname")
      .populate("gymId", "name")
      .exec();
  }

  /**
   * Récupérer les récompenses disponibles (non expirées)
   */
  async getAvailableRewards(): Promise<Reward[]> {
    return await RewardModel.find({
      $or: [{ validUntil: { $gt: new Date() } }, { validUntil: { $exists: false } }],
    })
      .populate("createdBy", "firstname lastname")
      .populate("gymId", "name")
      .exec();
  }

  /**
   * Mettre à jour une récompense
   */
  async updateReward(rewardId: string, updateData: Partial<Reward>): Promise<Reward | null> {
    return await RewardModel.findByIdAndUpdate(rewardId, updateData, { new: true })
      .populate("createdBy", "firstname lastname")
      .populate("gymId", "name")
      .exec();
  }

  /**
   * Supprimer une récompense
   */
  async deleteReward(rewardId: string): Promise<boolean> {
    const result = await RewardModel.findByIdAndDelete(rewardId);
    return !!result;
  }

  /**
   * Réclamer une récompense
   */
  async claimReward(
    userId: string,
    rewardId: string,
    claimedFrom?: {
      challengeId?: string;
      totalPoints?: number;
    }
  ): Promise<UserReward> {
    const reward = await RewardModel.findById(rewardId);
    if (!reward) {
      throw new Error("Récompense non trouvée");
    }

    const userReward = new UserRewardModel({
      userId: new Types.ObjectId(userId),
      rewardId: new Types.ObjectId(rewardId),
      claimedAt: new Date(),
      expiresAt: reward.validUntil,
      claimedFrom: claimedFrom && {
        challengeId: claimedFrom.challengeId ? new Types.ObjectId(claimedFrom.challengeId) : undefined,
        totalPoints: claimedFrom.totalPoints,
      },
    });

    return await userReward.save();
  }

  /**
   * Marquer une récompense comme utilisée
   */
  async useReward(userRewardId: string): Promise<UserReward | null> {
    return await UserRewardModel.findByIdAndUpdate(
      userRewardId,
      { usedAt: new Date() },
      { new: true }
    )
      .populate("rewardId")
      .exec();
  }

  /**
   * Récupérer les récompenses d'un utilisateur
   */
  async getUserRewards(userId: string): Promise<UserReward[]> {
    return await UserRewardModel.find({ userId: new Types.ObjectId(userId) })
      .populate("rewardId")
      .populate("claimedFrom.challengeId")
      .exec();
  }

  /**
   * Récupérer les récompenses non utilisées d'un utilisateur
   */
  async getUnclaimedRewards(userId: string): Promise<UserReward[]> {
    return await UserRewardModel.find({
      userId: new Types.ObjectId(userId),
      usedAt: { $exists: false },
      $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: { $exists: false } }],
    })
      .populate("rewardId")
      .exec();
  }

  /**
   * Obtenir les points disponibles d'un utilisateur à partir de ses défis complétés
   */
  async getUserAvailablePoints(userId: string): Promise<number> {
    // À implémenter: calculer les points totaux des défis complétés
    // moins les points utilisés pour les récompenses
    return 0;
  }
}
