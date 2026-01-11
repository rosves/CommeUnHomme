import { Types } from "mongoose";

export interface UserBadge {
  _id?: string;
  userId: Types.ObjectId;
  badgeId: Types.ObjectId;
  earnedAt: Date;
  earnedCount?: number;
  earnedFrom?: {
    challengeId?: Types.ObjectId;
    points?: number;
    reason?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
