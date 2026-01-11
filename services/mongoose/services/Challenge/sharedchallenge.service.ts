import { Mongoose, Model } from "mongoose";
import { SharedChallenge } from "../../../../models";
import { UserChallengeSharedModel } from "../../schema";

export class SharedChallengeService {
  readonly sharedChallengeModel: Model<SharedChallenge>;

  constructor(readonly connection: Mongoose) {
    this.sharedChallengeModel = UserChallengeSharedModel;
  }

  async shareChallenge(challengeId: string, sharedBy: string, sharedWith: string[]): Promise<SharedChallenge> {
    return this.sharedChallengeModel.create({
      challengeId,
      sharedBy,
      sharedWith
    });
  }

  async findSharedByUser(userId: string): Promise<SharedChallenge[]> {
    return this.sharedChallengeModel
      .find({ sharedBy: userId })
      .populate('challengeId', 'name description difficulty')
      .populate('sharedWith', 'firstname lastname');
  }


  async findSharedWithUser(userId: string): Promise<SharedChallenge[]> {
    return this.sharedChallengeModel
      .find({ sharedWith: userId })
      .populate('challengeId', 'name description difficulty points')
      .populate('sharedBy', 'firstname lastname');
  }

  async deleteShare(shareId: string): Promise<boolean> {
    const result = await this.sharedChallengeModel.findByIdAndDelete(shareId);
    return !!result;
  }

  async addUsersToShare(shareId: string, userIds: string[]): Promise<SharedChallenge | null> {
    return this.sharedChallengeModel.findByIdAndUpdate(
      shareId,
      { $addToSet: { sharedWith: { $each: userIds } } },
      { new: true }
    );
  }


  async removeUserFromShare(shareId: string, userId: string): Promise<SharedChallenge | null> {
    return this.sharedChallengeModel.findByIdAndUpdate(
      shareId,
      { $pull: { sharedWith: userId } },
      { new: true }
    );
  }
}