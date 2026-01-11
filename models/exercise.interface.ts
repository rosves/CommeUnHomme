import { Difficulties } from "./challenge";
import { Types } from "mongoose";

export enum Muscle {
  CHEST = "Pectoraux",
  BACK = "Dos",
  LEGS = "Jambes",
  SHOULDERS = "Épaules",
  ARMS = "Bras",
  ABS = "Abdominaux",
  CARDIO = "Cardio",
}

export interface Exercise {
  _id?: Types.ObjectId;
  name: string;
  description: string;
  muscleGroup: Muscle;
  difficulty: Difficulties;
  calories: number;
}
