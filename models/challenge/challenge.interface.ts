import { gymEquipements } from "../gym.interface";
import { Types } from "mongoose";

export enum Difficulties {
  BEGINNER = "Débutant",
  INTERMEDIATE = "Intermédiaire",
  ADVANCED = "Avancé",
}

export enum StatusChallenge {
  ACTIVE = "Actif",
  COMPLETED = "Terminé",
  ARCHIVED = "Archivé",
}

export enum Goal {
  LOSE_WEIGHT = "Perte de poids",
  GAIN_STRENGTH = "Prise de masse",
}

export interface Challenge {
  _id?: string;
  name: string;
  description: string;
  difficulty: Difficulties;
  points: number;
  equipment?: gymEquipements[];
  exercises?: {
    exerciseId: string;
    sets?: number;
    reps?: number;
    duration?: number;
    rest?: number;
  }[];
  gymId?: Types.ObjectId;
  startAt?: Date;
  endAt?: Date;
  createdBy: Types.ObjectId;
  isApproved: boolean;
  duration: {
    value: number;
    unit: "jours" | "semaines" | "mois";
  };
  status: StatusChallenge;
  goals?: Goal;
}
