import { Types } from "mongoose";

export interface UserReward {
  _id?: string;
  userId: Types.ObjectId;
  rewardId: Types.ObjectId;
  claimedAt: Date;
  usedAt?: Date;
  expiresAt?: Date;
  code?: string;
  claimedFrom?: {
    challengeId?: Types.ObjectId;
    totalPoints?: number;
    reason?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
