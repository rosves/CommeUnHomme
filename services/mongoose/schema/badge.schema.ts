import mongoose, { Schema } from "mongoose";
import { Badge, UserBadge } from "../../../models/badge";

const badgeSchema = new Schema<Badge>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    // Règles d'attribution automatique
    rules: {
      single: {
        type: {
          type: String,
          enum: [
            "challenges_completed",
            "total_points",
            "streak_days",
            "difficulty_master",
            "specific_challenge",
            "weight_milestone",
            "gym_attendance",
            "custom",
          ],
        },
        operator: {
          type: String,
          enum: ["égal", "supérieur", "supérieur_ou_égal", "inférieur", "inférieur_ou_égal"],
        },
        value: Schema.Types.Mixed,
        weight: Number,
      },
      multiple: {
        rules: [
          {
            type: {
              type: String,
              enum: [
                "challenges_completed",
                "total_points",
                "streak_days",
                "difficulty_master",
                "specific_challenge",
                "weight_milestone",
                "gym_attendance",
                "custom",
              ],
            },
            operator: {
              type: String,
              enum: ["eq", "gte", "lte", "gt", "lt"],
            },
            value: Schema.Types.Mixed,
            weight: Number,
          },
        ],
        logic: {
          type: String,
          enum: ["AND", "OR"],
          default: "AND",
        },
      },
      evaluator: String,
    },
    // Configuration
    maxEarnings: {
      type: Number,
      default: -1, // -1 = illimité
    },
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
    collection: "badges",
    versionKey: false,
    timestamps: true,
  }
);

const userBadgeSchema = new Schema<UserBadge>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge",
      required: true,
    },
    earnedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    earnedCount: {
      type: Number,
      default: 1,
    },
    earnedFrom: {
      challengeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Challenge",
      },
      points: {
        type: Number,
      },
      reason: String,
    },
  },
  {
    collection: "userBadges",
    versionKey: false,
    timestamps: true,
  }
);

export const BadgeModel =
  mongoose.models.Badge || mongoose.model<Badge>("Badge", badgeSchema);

export const UserBadgeModel =
  mongoose.models.UserBadge ||
  mongoose.model<UserBadge>("UserBadge", userBadgeSchema);
