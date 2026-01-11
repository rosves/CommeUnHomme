import mongoose, { Schema } from "mongoose";
import { Gym } from "../../../models";

const gymSchema = new Schema<Gym>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
        default: "France",
      },
    },
    contact: {
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    description: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    installations: [
      {
        type: String,
      },
    ],
    equipment: [
      {
        type: String,
      },
    ],
    exercises: [
      {
        type: String,
      },
    ],
    isApproved: {
      type: Boolean,
      default: false,
    },
    ownerId: {
      type: String,
      required: true,
    },
  },
  {
    collection: "gyms",
    versionKey: false,
  }
);

export const GymModel =
  mongoose.models.Gym || mongoose.model<Gym>("Gym", gymSchema);
