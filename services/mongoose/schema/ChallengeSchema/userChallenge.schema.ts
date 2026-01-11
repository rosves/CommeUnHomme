import mongoose, { Schema } from "mongoose";
import { UserChallenge } from "../../../../models";

const UserChallengeSchema = new Schema<UserChallenge>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    challengeId: { type: Schema.Types.ObjectId, ref: "Challenge" },
    completedAt: { type: Date },
    pointsEarned: { type: Number, required: true },
  },
  { versionKey: false, collection: "challenges" }
);

export const UserChallengeModel =
  mongoose.models.Challenge ||
  mongoose.model<UserChallenge>("Challenge", UserChallengeSchema);
