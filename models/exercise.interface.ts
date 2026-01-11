import { Difficulties } from "./challenge";

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
  _id?: string;
  name: string;
  description: string;
  muscleGroup: Muscle;
  difficulty: Difficulties;
  calories: number;
}
