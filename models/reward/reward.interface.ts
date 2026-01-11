import { Types } from "mongoose";

/**
 * Types de récompenses virtuelles
 */
export type RewardType =
  | "discount" // Réduction en %
  | "free_session" // Session gratuite
  | "equipment" // Équipement
  | "nutritional_plan" // Plan nutritionnel
  | "coaching_session" // Session de coaching
  | "gym_membership" // Extension d'abonnement
  | "custom"; // Personnalisée

/**
 * Récompense créée dynamiquement par l'administrateur
 */
export interface Reward {
  _id?: string;
  name: string;
  description: string;
  pointsCost: number; // Coût en points pour réclamer
  type: RewardType;

  // Détails de la récompense
  details?: {
    amount?: number; // Montant de réduction ou valeur
    percentage?: number; // % de réduction
    quantity?: number; // Quantité (ex: nombre de sessions)
    duration?: {
      value: number;
      unit: "Jour" | "Semaine" | "Mois";
    };
    code?: string; // Code promo si applicable
  };

  // Limites et conditions
  validUntil?: Date; // Date d'expiration de la récompense
  maxClaims?: number; // Nombre max de fois qu'elle peut être réclaimée (-1 = illimité)
  claimedCount?: number; // Nombre actuellement réclamé
  gymId?: Types.ObjectId; // Gym spécifique si applicable
  
  // Configuration
  isActive: boolean; // Récompense active ou archivée
  createdBy: Types.ObjectId; // Admin qui l'a créée
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Suivi des récompenses réclamées par les utilisateurs
 */
export interface UserReward {
  _id?: string;
  userId: Types.ObjectId;
  rewardId: Types.ObjectId;
  claimedAt: Date; // Quand l'utilisateur l'a réclamée
  usedAt?: Date; // Quand l'utilisateur l'a utilisée
  expiresAt?: Date; // Quand la récompense expire
  code?: string; // Code d'activation si applicable
  claimedFrom?: {
    challengeId?: Types.ObjectId; // Défi spécifique
    totalPoints?: number; // Points dépensés
    reason?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
