import { Types } from "mongoose";

export interface UserChallenge {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  challengeId: Types.ObjectId;
  completedAt?: Date;
  pointsEarned: number;
}
