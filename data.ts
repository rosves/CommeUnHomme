/**
 * Script de Population - Initialise la base de données avec des données de test
 * 
 * Usage:
 * npm run data
 * ou
 * npm run data:build
 */

import mongoose from "mongoose";
import * as bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

// Import models
import { UserModel } from "./services/mongoose/schema/user.schema";
import { ExerciseModel } from "./services/mongoose/schema/exercise.schema";
import { GymModel } from "./services/mongoose/schema/gym.schema";
import { BadgeModel } from "./services/mongoose/schema/badge.schema";
import { RewardModel } from "./services/mongoose/schema/reward.schema";
import { ChallengeModel } from "./services/mongoose/schema/ChallengeSchema/challenge.schema";

// Types
import { UserRole } from "./models";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.MONGODB_DATABASE || "fitness_db";

interface SeedUser {
  lastname: string;
  firstname: string;
  login: string;
  password: string;
  role: string;
  weight: number;
  birthdate: Date;
}

async function connectDB() {
  try {
    await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);
    console.log("✅ MongoDB connecté");
  } catch (error) {
    console.error("❌ Erreur connexion MongoDB:", error);
    process.exit(1);
  }
}

async function clearDB() {
  try {
    await Promise.all([
      UserModel.deleteMany({}),
      ExerciseModel.deleteMany({}),
      GymModel.deleteMany({}),
      BadgeModel.deleteMany({}),
      RewardModel.deleteMany({}),
      ChallengeModel.deleteMany({}),
    ]);
    console.log("🧹 Base de données vidée");
  } catch (error) {
    console.error("❌ Erreur nettoyage:", error);
  }
}

async function seedUsers() {
  const users: SeedUser[] = [
    {
      lastname: "Admin",
      firstname: "Super",
      login: "admin@fitness.com",
      password: "admin123",
      role: UserRole.ADMIN,
      weight: 75,
      birthdate: new Date("1990-01-15"),
    },
    {
      lastname: "Owner",
      firstname: "Gym",
      login: "owner@fitnessgym.com",
      password: "owner123",
      role: UserRole.OWNER,
      weight: 80,
      birthdate: new Date("1985-05-20"),
    },
    {
      lastname: "Dupont",
      firstname: "Jean",
      login: "jean.dupont@email.com",
      password: "customer123",
      role: UserRole.CUSTOMER,
      weight: 85,
      birthdate: new Date("1995-03-10"),
    },
    {
      lastname: "Martin",
      firstname: "Marie",
      login: "marie.martin@email.com",
      password: "customer123",
      role: UserRole.CUSTOMER,
      weight: 65,
      birthdate: new Date("2000-07-25"),
    },
    {
      lastname: "Bernard",
      firstname: "Pierre",
      login: "pierre.bernard@email.com",
      password: "customer123",
      role: UserRole.CUSTOMER,
      weight: 90,
      birthdate: new Date("1988-11-30"),
    },
  ];

  try {
    const createdUsers = await UserModel.insertMany(users);
    console.log(`✅ ${createdUsers.length} utilisateurs créés`);
    return createdUsers;
  } catch (error) {
    console.error("❌ Erreur création utilisateurs:", error);
    return [];
  }
}

async function seedExercises() {
  const exercises = [
    {
      name: "Course à Pied",
      description: "Cardio running en extérieur ou tapis",
      muscleGroup: "Jambes",
      difficulty: "Débutant",
      calories: 500,
    },
    {
      name: "Développé Couché",
      description: "Musculation poitrine avec haltères ou barre",
      muscleGroup: "Poitrine",
      difficulty: "Intermédiaire",
      calories: 300,
    },
    {
      name: "Squats",
      description: "Exercice jambes avec poids du corps",
      muscleGroup: "Jambes",
      difficulty: "Intermédiaire",
      calories: 350,
    },
    {
      name: "Planche",
      description: "Renforcement core - isométrie",
      muscleGroup: "Abdominaux",
      difficulty: "Débutant",
      calories: 200,
    },
    {
      name: "Deadlift",
      description: "Soulevé de terre - musculation complète",
      muscleGroup: "Dos",
      difficulty: "Avancé",
      calories: 400,
    },
    {
      name: "Burpees",
      description: "Cardio intensif combiné musculation",
      muscleGroup: "Corps complet",
      difficulty: "Avancé",
      calories: 450,
    },
    {
      name: "Natation",
      description: "Endurance et cardio en piscine",
      muscleGroup: "Corps complet",
      difficulty: "Intermédiaire",
      calories: 550,
    },
    {
      name: "Flexions (Push-ups)",
      description: "Musculation poitrine sans équipement",
      muscleGroup: "Poitrine",
      difficulty: "Débutant",
      calories: 250,
    },
  ];

  try {
    const createdExercises = await ExerciseModel.insertMany(exercises);
    console.log(`✅ ${createdExercises.length} exercices créés`);
    return createdExercises;
  } catch (error) {
    console.error("❌ Erreur création exercices:", error);
    return [];
  }
}

async function seedGyms() {
  const gyms = [
    {
      name: "FitPro Paris",
      address: "123 Rue de Rivoli, 75001 Paris",
      capacity: 200,
      equipment: [
        "Tapis de course",
        "Haltères",
        "Bancs de musculation",
        "Piscine",
      ],
      description: "Salle de sport moderne au cœur de Paris",
      isApproved: true,
    },
    {
      name: "Gym Villeneuve",
      address: "456 Avenue des Champs, 92400 Villeneuve",
      capacity: 150,
      equipment: ["Cardio", "Haltères", "CrossFit"],
      description: "Centre fitness complet avec cours collectifs",
      isApproved: true,
    },
    {
      name: "Elite Fitness Club",
      address: "789 Boulevard Saint-Michel, 75005 Paris",
      capacity: 300,
      equipment: ["Tous les équipements", "Piscine", "Sauna", "Spa"],
      description: "Club premium avec services haut de gamme",
      isApproved: false,
    },
  ];

  try {
    const createdGyms = await GymModel.insertMany(gyms);
    console.log(`✅ ${createdGyms.length} salles créées`);
    return createdGyms;
  } catch (error) {
    console.error("❌ Erreur création salles:", error);
    return [];
  }
}

async function seedBadges() {
  const badges = [
    {
      name: "100 Points Master",
      description: "Accumulez 100 points",
      rules: {
        single: {
          type: "total_points",
          operator: "supérieur_ou_égal",
          value: 100,
        },
      },
      maxEarnings: 1,
      isActive: true,
      createdBy: "admin_id",
    },
    {
      name: "500 Points Champion",
      description: "Accumulez 500 points - niveau expert",
      rules: {
        single: {
          type: "total_points",
          operator: "supérieur_ou_égal",
          value: 500,
        },
      },
      maxEarnings: 1,
      isActive: true,
      createdBy: "admin_id",
    },
    {
      name: "5-Challenge Expert",
      description: "Complétez 5 défis",
      rules: {
        single: {
          type: "challenges_completed",
          operator: "supérieur_ou_égal",
          value: 5,
        },
      },
      maxEarnings: 1,
      isActive: true,
      createdBy: "admin_id",
    },
    {
      name: "7-Day Warrior",
      description: "7 jours consécutifs d'entraînement",
      rules: {
        single: {
          type: "streak_days",
          operator: "supérieur_ou_égal",
          value: 7,
        },
      },
      maxEarnings: 1,
      isActive: true,
      createdBy: "admin_id",
    },
    {
      name: "Difficulty Master",
      description: "Maîtrisez la difficulté avancée",
      rules: {
        single: {
          type: "difficulty_master",
          operator: "égal",
          value: "Avancé",
        },
      },
      maxEarnings: 1,
      isActive: true,
      createdBy: "admin_id",
    },
  ];

  try {
    const createdBadges = await BadgeModel.insertMany(badges);
    console.log(`✅ ${createdBadges.length} badges créés`);
    return createdBadges;
  } catch (error) {
    console.error("❌ Erreur création badges:", error);
    return [];
  }
}

async function seedRewards() {
  const rewards = [
    {
      name: "Réduction 10% Abonnement",
      description: "Code réduction pour 10% de votre abonnement",
      pointsCost: 50,
      type: "discount",
      details: {
        percentage: 10,
        code: "DISCOUNT10",
      },
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 jours
      maxClaims: 100,
      claimedCount: 0,
      isActive: true,
      createdBy: "admin_id",
    },
    {
      name: "1h Coaching Session",
      description: "Une heure de coaching personnalisé",
      pointsCost: 150,
      type: "coaching_session",
      details: {
        duration: { value: 1, unit: "hours" },
        code: "COACH-1H-001",
      },
      validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 jours
      maxClaims: 50,
      claimedCount: 0,
      isActive: true,
      createdBy: "admin_id",
    },
    {
      name: "1 Session Massage Gratuite",
      description: "Profitez d'une séance de massage relaxant",
      pointsCost: 100,
      type: "free_session",
      details: {
        sessionType: "Massage",
        duration: { value: 1, unit: "hours" },
        code: "MASSAGE-001",
      },
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 jours
      maxClaims: 30,
      claimedCount: 0,
      isActive: true,
      createdBy: "admin_id",
    },
    {
      name: "Pack Protéines Premium",
      description: "Boîte de protéines en poudre premium",
      pointsCost: 120,
      type: "equipment",
      details: {
        productName: "Whey Gold Standard 2kg",
        quantity: 1,
        code: "PROTEIN-GOLD",
      },
      validUntil: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 jours
      maxClaims: 25,
      claimedCount: 0,
      isActive: true,
      createdBy: "admin_id",
    },
    {
      name: "1 Mois Abonnement Gratuit",
      description: "Extension gratuite d'un mois à votre abonnement",
      pointsCost: 300,
      type: "gym_membership",
      details: {
        duration: { value: 1, unit: "month" },
        code: "FREE-MONTH-2026",
      },
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
      maxClaims: 20,
      claimedCount: 0,
      isActive: true,
      createdBy: "admin_id",
    },
    {
      name: "Plan Nutritionnel Personnalisé",
      description: "Consultation diététique + plan nutrition sur mesure",
      pointsCost: 200,
      type: "nutritional_plan",
      details: {
        consultationHours: 2,
        planDuration: { value: 1, unit: "month" },
        code: "NUTRITION-FULL",
      },
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 jours
      maxClaims: 15,
      claimedCount: 0,
      isActive: true,
      createdBy: "admin_id",
    },
  ];

  try {
    const createdRewards = await RewardModel.insertMany(rewards);
    console.log(`✅ ${createdRewards.length} récompenses créées`);
    return createdRewards;
  } catch (error) {
    console.error("❌ Erreur création récompenses:", error);
    return [];
  }
}

async function seedChallenges(
  users: any[],
  exercises: any[],
  gyms: any[]
) {
  const owner = users.find((u) => u.role === UserRole.OWNER);
  const gym = gyms[0];

  const challenges = [
    {
      name: "5km Daily Run",
      description: "Courez 5km quotidiennement pendant 7 jours",
      difficulty: "facile",
      duration: 7,
      exercices: [exercises[0]._id],
      gym: gym?._id,
      createdBy: owner?._id,
      pointsReward: 50,
      status: "approved",
      isApproved: true,
    },
    {
      name: "Push-Up Challenge",
      description: "Faites 100 push-ups répartis sur la semaine",
      difficulty: "moyen",
      duration: 7,
      exercices: [exercises[7]._id],
      gym: gym?._id,
      createdBy: owner?._id,
      pointsReward: 75,
      status: "approved",
      isApproved: true,
    },
    {
      name: "Leg Day Warrior",
      description: "Entraînement intensif des jambes - 3 sessions",
      difficulty: "difficile",
      duration: 14,
      exercices: [exercises[2]._id, exercises[0]._id],
      gym: gym?._id,
      createdBy: owner?._id,
      pointsReward: 100,
      status: "approved",
      isApproved: true,
    },
    {
      name: "Full Body Transformation",
      description: "Programme complet - cardio, musculation, flexibilité",
      difficulty: "difficile",
      duration: 30,
      exercices: [
        exercises[0]._id,
        exercises[1]._id,
        exercises[2]._id,
        exercises[5]._id,
      ],
      gym: gym?._id,
      createdBy: owner?._id,
      pointsReward: 200,
      status: "approved",
      isApproved: true,
    },
    {
      name: "Swimming Marathon",
      description: "Natation intense - 10 sessions d'1h minimum",
      difficulty: "moyen",
      duration: 21,
      exercices: [exercises[6]._id],
      gym: gym?._id,
      createdBy: owner?._id,
      pointsReward: 120,
      status: "approved",
      isApproved: true,
    },
    {
      name: "Deadlift Master",
      description: "Progressez en deadlift - technique et puissance",
      difficulty: "difficile",
      duration: 28,
      exercices: [exercises[4]._id],
      gym: gym?._id,
      createdBy: owner?._id,
      pointsReward: 150,
      status: "pending",
      isApproved: false,
    },
  ];

  try {
    const createdChallenges = await ChallengeModel.insertMany(challenges);
    console.log(`✅ ${createdChallenges.length} défis créés`);
    return createdChallenges;
  } catch (error) {
    console.error("❌ Erreur création défis:", error);
    return [];
  }
}

async function main() {
  console.log("🌱 Démarrage du seed...\n");

  try {
    await connectDB();
    await clearDB();

    // Seed dans l'ordre correct
    const users = await seedUsers();
    const exercises = await seedExercises();
    const gyms = await seedGyms();
    const badges = await seedBadges();
    const rewards = await seedRewards();
    const challenges = await seedChallenges(users, exercises, gyms);

    console.log("\n✨ Seed terminé avec succès!");
    console.log("\n📋 Données créées:");
    console.log(`   - Utilisateurs: ${users.length}`);
    console.log(`   - Exercices: ${exercises.length}`);
    console.log(`   - Salles: ${gyms.length}`);
    console.log(`   - Badges: ${badges.length}`);
    console.log(`   - Récompenses: ${rewards.length}`);
    console.log(`   - Défis: ${challenges.length}`);

    console.log("\n🔑 Comptes de Test:");
    console.log("   ADMIN:    admin@fitness.com / admin123");
    console.log("   OWNER:    owner@fitnessgym.com / owner123");
    console.log("   CUSTOMER: jean.dupont@email.com / customer123");
    console.log("   CUSTOMER: marie.martin@email.com / customer123");
    console.log("   CUSTOMER: pierre.bernard@email.com / customer123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur durant le seed:", error);
    process.exit(1);
  }
}

main();
