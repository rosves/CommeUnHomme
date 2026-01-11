import mongoose, { Schema } from "mongoose";
import { SharedChallenge } from "../../../../models";

const UserChallengeSharedSchema = new Schema<SharedChallenge>(
  {
    challengeId: { type: Schema.Types.ObjectId, ref: "Challenge" },
    sharedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false, collection: "sharedChallenges" }
);

export const UserChallengeSharedModel =
  mongoose.models.Challenge ||
  mongoose.model<SharedChallenge>(
    "UserChallengeShared",
    UserChallengeSharedSchema
  );
