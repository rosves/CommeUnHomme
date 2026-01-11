import mongoose, { Schema } from "mongoose";
import { Reward, UserReward } from "../../../models/reward";

const rewardSchema = new Schema<Reward>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    pointsCost: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["discount", "free_session", "equipment", "nutritional_plan", "coaching_session", "gym_membership", "custom"],
      required: true,
    },
    // Détails de la récompense
    details: {
      amount: Number,
      percentage: Number,
      quantity: Number,
      duration: {
        value: Number,
        unit: {
          type: String,
          enum: ["Jour", "Semaine", "Mois"],
        },
      },
      code: String,
    },
    // Limites et conditions
    validUntil: {
      type: Date,
    },
    maxClaims: {
      type: Number,
      default: -1, // -1 = illimité
    },
    claimedCount: {
      type: Number,
      default: 0,
    },
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
    },
    // Configuration
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    collection: "rewards",
    versionKey: false,
    timestamps: true,
  }
);

const userRewardSchema = new Schema<UserReward>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rewardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reward",
      required: true,
    },
    claimedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    usedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    code: String,
    claimedFrom: {
      challengeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Challenge",
      },
      totalPoints: Number,
      reason: String,
    },
  },
  {
    collection: "userRewards",
    versionKey: false,
    timestamps: true,
  }
);

export const RewardModel =
  mongoose.models.Reward || mongoose.model<Reward>("Reward", rewardSchema);

export const UserRewardModel =
  mongoose.models.UserReward ||
  mongoose.model<UserReward>("UserReward", userRewardSchema);
