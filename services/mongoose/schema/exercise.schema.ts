import mongoose, { Schema } from "mongoose";
import { Exercise, Muscle } from "../../../models";

const ExerciseSchema = new Schema<Exercise>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    muscleGroup: {
      type: String,
      enum: Object.values(Muscle),
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Débutant", "Intermédiaire", "Avancé"],
      required: true,
    },
  },
  { versionKey: false }
);

export const ExerciseModel =
  mongoose.models.Exercise ||
  mongoose.model<Exercise>("Exercise", ExerciseSchema);
