import { Types } from "mongoose";

export interface SharedChallenge {
  _id?: string;
  challengeId: Types.ObjectId;
  sharedBy: Types.ObjectId;
  sharedWith?: Types.ObjectId[];
  createdAt?: Date;
}
