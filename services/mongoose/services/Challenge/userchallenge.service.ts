import { Mongoose, Model } from "mongoose";
import { UserChallenge } from "../../../../models";
import { UserChallengeModel } from "../../schema";

export class UserChallengeService {
  readonly userChallengeModel: Model<UserChallenge>;

  constructor(readonly connection: Mongoose) {
    this.userChallengeModel = UserChallengeModel;
  }

  async joinChallenge(userId: string, challengeId: string): Promise<UserChallenge> {
    // Vérifier si déjà inscrit
    const existing = await this.userChallengeModel.findOne({ userId, challengeId });
    if (existing) {
      throw new Error('Vous participez déjà à ce défi');
    }

    return this.userChallengeModel.create({
      userId,
      challengeId,
      pointsEarned: 0
    });
  }

  async completeChallenge(userId: string, challengeId: string, points: number): Promise<UserChallenge | null> {
    return this.userChallengeModel.findOneAndUpdate(
      { userId, challengeId },
      { 
        completedAt: new Date(),
        pointsEarned: points
      },
      { new: true }
    );
  }

  async findUserChallenges(userId: string): Promise<UserChallenge[]> {
    return this.userChallengeModel
      .find({ userId })
      .populate('challengeId', 'name description difficulty points status');
  }

  async findCompletedChallenges(userId: string): Promise<UserChallenge[]> {
    return this.userChallengeModel
      .find({ userId, completedAt: { $exists: true } })
      .populate('challengeId', 'name difficulty points');
  }

  async findActiveChallenges(userId: string): Promise<UserChallenge[]> {
    return this.userChallengeModel
      .find({ userId, completedAt: { $exists: false } })
      .populate('challengeId', 'name description difficulty points status endAt');
  }

  async getUserTotalPoints(userId: string): Promise<number> {
    const result = await this.userChallengeModel.aggregate([
      { $match: { userId, completedAt: { $exists: true } } },
      { $group: { _id: null, totalPoints: { $sum: '$pointsEarned' } } }
    ]);

    return result.length > 0 ? result[0].totalPoints : 0;
  }

  async getChallengeParticipants(challengeId: string): Promise<UserChallenge[]> {
    return this.userChallengeModel
      .find({ challengeId })
      .populate('userId', 'firstname lastname');
  }

  async leaveChallenge(userId: string, challengeId: string): Promise<boolean> {
    const result = await this.userChallengeModel.findOneAndDelete({ userId, challengeId });
    return !!result;
  }

  async isUserParticipating(userId: string, challengeId: string): Promise<boolean> {
    const participation = await this.userChallengeModel.findOne({ userId, challengeId });
    return !!participation;
  }
}