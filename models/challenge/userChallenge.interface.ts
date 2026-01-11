import { Types } from "mongoose";

export interface UserChallenge {
  _id?: string;
  userId: Types.ObjectId;
  challengeId: Types.ObjectId;
  completedAt?: Date;
  pointsEarned: number;
}
