import { Types } from "mongoose";

export interface SharedChallenge {
  _id?: Types.ObjectId;
  challengeId: Types.ObjectId;
  sharedBy: Types.ObjectId;
  sharedWith?: Types.ObjectId[];
  createdAt?: Date;
}
