import mongoose, { Schema } from "mongoose";
import {
  Challenge,
  Difficulties,
  gymEquipements,
  StatusChallenge,
  Goal,
} from "../../../../models";

const ChallengeSchema = new Schema<Challenge>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      enum: Object.values(Difficulties),
      required: true,
    },
    points: { type: Number, required: true },
    equipment: [{ type: String, enum: Object.values(gymEquipements) }],
    exercises: [
      {
        exerciseId: {
          type: Schema.Types.ObjectId,
          ref: "Exercise",
          required: true,
        },
        sets: Number,
        reps: Number,
        duration: Number,
        rest: Number,
      },
    ],
    gymId: { type: Schema.Types.ObjectId, ref: "Gym" },
    startAt: { type: Date },
    endAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isApproved: { type: Boolean, default: false },
    duration: {
      value: { type: Number, required: true },
      unit: {
        type: String,
        enum: ["jours", "semaines", "mois"],
        required: true,
      },
    },
    status: {
      type: String,
      enum: Object.values(StatusChallenge),
      required: true,
    },
    goals: { type: String, enum: Object.values(Goal) },
  },
  { versionKey: false, collection: "challenges" }
);

ChallengeSchema.pre("save", async function (next) {
  switch (this.difficulty) {
    case Difficulties.BEGINNER:
      this.points = 30;
      break;
    case Difficulties.INTERMEDIATE:
      this.points = 50;
      break;
    case Difficulties.ADVANCED:
      this.points = 70;
      break;
  }
  this.status = StatusChallenge.ACTIVE;
  next();
});

export const ChallengeModel =
  mongoose.models.Challenge ||
  mongoose.model<Challenge>("Challenge", ChallengeSchema);
