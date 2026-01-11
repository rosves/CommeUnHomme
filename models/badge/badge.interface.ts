import { Types } from "mongoose";

/**
 * Type de règle pour l'attribution automatique de badges
 */
export type RuleType =
  | "challenges_completed" // Nombre de défis complétés
  | "total_points" // Nombre total de points accumulés
  | "streak_days" // Nombre de jours consécutifs
  | "difficulty_master" // Tous les défis d'une difficulté complétés
  | "specific_challenge" // Défi spécifique complété
  | "weight_milestone" // Perte/gain de poids
  | "gym_attendance" // Nombre de sessions au gymnase
  | "custom"; // Règle personnalisée

/**
 * Définit une condition pour évaluer l'attribution d'un badge
 */
export interface BadgeRule {
  type: RuleType;
  operator: "égal" | "supérieur" | "supérieur_ou_égal" | "inférieur" | "inférieur_ou_égal"; // Opérateur de comparaison
  value: any; // Valeur à comparer
  weight?: number; // Poids pour les règles composées
}

/**
 * Badge créé dynamiquement par l'administrateur
 */
export interface Badge {
  _id?: string;
  name: string;
  description: string;
  
  // Règles d'attribution automatique
  rules?: {
    // Une seule règle simple OU multiple règles avec logique
    single?: BadgeRule; // Une seule condition
    multiple?: {
      rules: BadgeRule[]; // Liste de règles
      logic: "AND" | "OR"; // Logique combinatoire
    };
    // Évaluation personnalisée
    evaluator?: string; // Code ou ID de fonction personnalisée
  };

  // Configuration
  maxEarnings?: number; // Nombre max de fois qu'on peut l'obtenir (-1 = illimité)
  isActive: boolean; // Badge actif ou archivé
  createdBy: Types.ObjectId; // Admin qui l'a créé
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Suivi de l'obtention d'un badge par un utilisateur
 */
export interface UserBadge {
  _id?: string;
  userId: Types.ObjectId;
  badgeId: Types.ObjectId;
  earnedAt: Date;
  earnedCount?: number; // Si le badge peut être obtenu plusieurs fois
  earnedFrom?: {
    challengeId?: Types.ObjectId;
    points?: number;
    reason?: string; // Description de pourquoi le badge a été obtenu
  };
  createdAt?: Date;
  updatedAt?: Date;
}
