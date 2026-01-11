import { Exercise } from "./";
export interface Gym {
  _id?: string;
  name: string;
  address: {
    street: string;
    zipCode: string;
    city: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
  };
  description: string;
  capacity: number;
  installations: string[];
  equipment: gymEquipements[];
  exercises: Exercise[];
  isApproved: boolean;
  ownerId: string;
}

export enum gymEquipements {
  BENCH = "Bancs de muscu",
  DUMBBELLS = "Haltères",
  BARBELLS = "Barres",
  WEIGHT_PLATES = "Disques de poids",
  LEG_PRESS = "Presse à cuisses",
  LEG_EXTENSION = "Extension de jambes",
  LEG_CURL = "Curl ischio-jambiers",
  CHEST_PRESS = "Presse pectorale",
  LAT_PULLDOWN = "Tirage vertical",
  SEATED_ROW = "Rowing assis",
  SHOULDER_PRESS = "Presse épaules",
  CABLE_MACHINE = "Machine à câbles",
  TREADMILL = "Tapis de course",
  EXERCISE_BIKE = "Vélo d’appartement",
  SPIN_BIKE = "Vélo spinning",
  ELLIPTICAL = "Vélo elliptique",
  ROWING_MACHINE = "Rameur",
  STAIR_CLIMBER = "Escalier stepper",
  SQUAT_RACK = "Cages de squat",
  SMITH_MACHINE = "Machine Smith",
  KETTLEBELLS = "Kettlebells",
  MEDICINE_BALLS = "Medecine balls",
  BATTLE_ROPES = "Cordes ondulatoires",
  TRX = "Sangles TRX",
  YOGA_MATS = "Tapis de yoga",
  FOAM_ROLLERS = "Rouleaux de massage",
  STRETCHING_AREA = "Zone d’étirement",
}
