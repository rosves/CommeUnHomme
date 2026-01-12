/**
 * Script de Population - Initialise la base de données avec des données de test
 *
 * Usage:
 * npm run data
 * ou
 * npm run data:build
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

// Import models
import { UserModel } from "./services/mongoose/schema/user.schema";
import { ExerciseModel } from "./services/mongoose/schema/exercise.schema";
import { GymModel } from "./services/mongoose/schema/gym.schema";
import { BadgeModel } from "./services/mongoose/schema/badge.schema";
import { RewardModel } from "./services/mongoose/schema/reward.schema";
import { ChallengeModel } from "./services/mongoose/schema/ChallengeSchema/challenge.schema";
import { UserChallengeModel } from "./services/mongoose/schema/ChallengeSchema/userChallenge.schema";

// Types
import { UserRole } from "./models";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_USER = process.env.MONGODB_USER || "root";
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD || "dfbhjn1l4567";
const DB_NAME = process.env.MONGODB_DATABASE || "fitness_db";

async function connectDB() {
  try {
    const uri = `mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@localhost:27017/${DB_NAME}?authSource=admin`;

    await mongoose.connect(uri);
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
  const users = [
    {
      lastname: "Admin",
      firstname: "Super",
      login: "admin@fitness.com",
      password: await bcrypt.hash("admin123", 10),
      role: UserRole.ADMIN,
      weight: 75,
      birthdate: new Date("1990-01-15"),
    },
    {
      lastname: "Owner",
      firstname: "Gym",
      login: "owner@fitnessgym.com",
      password: await bcrypt.hash("owner123", 10),
      role: UserRole.OWNER,
      weight: 80,
      birthdate: new Date("1985-05-20"),
    },
    {
      lastname: "Dupont",
      firstname: "Jean",
      login: "jean.dupont@email.com",
      password: await bcrypt.hash("customer123", 10),
      role: UserRole.CUSTOMER,
      weight: 85,
      birthdate: new Date("1995-03-10"),
    },
    {
      lastname: "Martin",
      firstname: "Marie",
      login: "marie.martin@email.com",
      password: await bcrypt.hash("customer123", 10),
      role: UserRole.CUSTOMER,
      weight: 65,
      birthdate: new Date("2000-07-25"),
    },
    {
      lastname: "Bernard",
      firstname: "Pierre",
      login: "pierre.bernard@email.com",
      password: await bcrypt.hash("customer123", 10),
      role: UserRole.CUSTOMER,
      weight: 90,
      birthdate: new Date("1988-11-30"),
    },
    {
      lastname: "Laurent",
      firstname: "Sophie",
      login: "sophie.laurent@email.com",
      password: "customer123",
      role: UserRole.CUSTOMER,
      weight: 70,
      birthdate: new Date("1992-02-14"),
    },
    {
      lastname: "Moreau",
      firstname: "Thomas",
      login: "thomas.moreau@email.com",
      password: "customer123",
      role: UserRole.CUSTOMER,
      weight: 82,
      birthdate: new Date("1991-08-22"),
    },
  ];

  try {
    const createdUsers = await UserModel.insertMany(users);
    console.log(`✅ ${createdUsers.length} utilisateurs créés`);
    console.log(createdUsers);
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
      muscleGroup: "Cardio",
      difficulty: "Débutant",
      calories: 500,
    },
    {
      name: "Développé Couché",
      description: "Musculation poitrine avec haltères ou barre",
      muscleGroup: "Pectoraux",
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
      muscleGroup: "Cardio",
      difficulty: "Avancé",
      calories: 450,
    },
    {
      name: "Natation",
      description: "Endurance et cardio en piscine",
      muscleGroup: "Cardio",
      difficulty: "Intermédiaire",
      calories: 550,
    },
    {
      name: "Flexions (Push-ups)",
      description: "Musculation poitrine sans équipement",
      muscleGroup: "Pectoraux",
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

async function seedGyms(users: any[]) {
  const owner = users.find((u) => u.role === UserRole.OWNER);

  const gyms = [
    {
      name: "FitPro Paris",
      address: {
        street: "123 Rue de Rivoli",
        zipCode: "75001",
        city: "Paris",
        country: "France",
      },
      contact: {
        phone: "01 23 45 67 89",
        email: "contact@fitpro.fr",
      },
      capacity: 200,
      installations: ["Cardio", "Musculation", "Stretching"],
      equipment: ["Tapis de course", "Haltères", "Bancs de musculation"],
      description: "Salle de sport moderne au cœur de Paris",
      ownerId: owner._id,
      isApproved: true,
    },
    {
      name: "Gym Villeneuve",
      address: {
        street: "456 Avenue des Champs",
        zipCode: "92400",
        city: "Villeneuve",
        country: "France",
      },
      contact: {
        phone: "01 98 76 54 32",
        email: "info@villeneuve-gym.fr",
      },
      capacity: 150,
      installations: ["Cardio", "CrossFit"],
      equipment: ["Tapis de course", "Haltères", "Kettlebells"],
      description: "Centre fitness complet avec cours collectifs",
      ownerId: owner._id,
      isApproved: true,
    },
    {
      name: "Elite Fitness Club",
      address: {
        street: "789 Boulevard Saint-Michel",
        zipCode: "75005",
        city: "Paris",
        country: "France",
      },
      contact: {
        phone: "01 55 66 77 88",
        email: "hello@elite-fitness.com",
      },
      capacity: 300,
      installations: ["Premium", "Spa", "Sauna"],
      equipment: ["Tous les équipements", "Piscine", "Sauna", "Spa"],
      description: "Club premium avec services haut de gamme",
      ownerId: owner._id,
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

async function seedBadges(users: any[]) {
  const admin = users.find((u) => u.role === UserRole.ADMIN);

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
      createdBy: admin._id,
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
      createdBy: admin._id,
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
      createdBy: admin._id,
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
      createdBy: admin._id,
    },
    {
      name: "Difficulty Master",
      description: "Complétez 3 défis niveau Avancé",
      rules: {
        single: {
          type: "difficulty_master",
          operator: "supérieur_ou_égal",
          value: 3,
        },
      },
      maxEarnings: 1,
      isActive: true,
      createdBy: admin._id,
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

async function seedRewards(users: any[]) {
  const admin = users.find((u) => u.role === UserRole.ADMIN);

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
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      maxClaims: 100,
      claimedCount: 0,
      isActive: true,
      createdBy: admin._id,
    },
    {
      name: "1h Coaching Session",
      description: "Une heure de coaching personnalisé",
      pointsCost: 150,
      type: "coaching_session",
      details: {
        duration: { value: 1, unit: "Mois" },
        code: "COACH-1H-001",
      },
      validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      maxClaims: 50,
      claimedCount: 0,
      isActive: true,
      createdBy: admin._id,
    },
    {
      name: "1 Session Massage Gratuite",
      description: "Profitez d'une séance de massage relaxant",
      pointsCost: 100,
      type: "free_session",
      details: {
        sessionType: "Massage",
        duration: { value: 1, unit: "Jour" },
        code: "MASSAGE-001",
      },
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      maxClaims: 30,
      claimedCount: 0,
      isActive: true,
      createdBy: admin._id,
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
      validUntil: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      maxClaims: 25,
      claimedCount: 0,
      isActive: true,
      createdBy: admin._id,
    },
    {
      name: "1 Mois Abonnement Gratuit",
      description: "Extension gratuite d'un mois à votre abonnement",
      pointsCost: 300,
      type: "gym_membership",
      details: {
        duration: { value: 1, unit: "Mois" },
        code: "FREE-MONTH-2026",
      },
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      maxClaims: 20,
      claimedCount: 0,
      isActive: true,
      createdBy: admin._id,
    },
    {
      name: "Plan Nutritionnel Personnalisé",
      description: "Consultation diététique + plan nutrition sur mesure",
      pointsCost: 200,
      type: "nutritional_plan",
      details: {
        consultationHours: 2,
        duration: { value: 1, unit: "Mois" },
        code: "NUTRITION-FULL",
      },
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      maxClaims: 15,
      claimedCount: 0,
      isActive: true,
      createdBy: admin._id,
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

async function seedChallenges(users: any[], exercises: any[], gyms: any[]) {
  const owner = users.find((u) => u.role === UserRole.OWNER);
  const gym = gyms[0];

  const challenges = [
    {
      name: "5km Daily Run",
      description: "Courez 5km quotidiennement pendant 7 jours",
      difficulty: "Débutant",
      duration: { value: 7, unit: "jour" },
      exercises: [{ exerciseId: exercises[0]._id }],
      gymId: gym?._id,
      createdBy: owner?._id,
      points: 50,
      status: "Actif",
      isApproved: true,
    },
    {
      name: "Push-Up Challenge",
      description: "Faites 100 push-ups répartis sur la semaine",
      difficulty: "Intermédiaire",
      duration: { value: 7, unit: "jour" },
      exercises: [{ exerciseId: exercises[7]._id }],
      gymId: gym?._id,
      createdBy: owner?._id,
      points: 75,
      status: "Actif",
      isApproved: true,
    },
    {
      name: "Leg Day Warrior",
      description: "Entraînement intensif des jambes - 3 sessions",
      difficulty: "Avancé",
      duration: { value: 14, unit: "jour" },
      exercises: [
        { exerciseId: exercises[2]._id },
        { exerciseId: exercises[0]._id },
      ],
      gymId: gym?._id,
      createdBy: owner?._id,
      points: 100,
      status: "Actif",
      isApproved: true,
    },
    {
      name: "Full Body Transformation",
      description: "Programme complet - cardio, musculation, flexibilité",
      difficulty: "Avancé",
      duration: { value: 30, unit: "jour" },
      exercises: [
        { exerciseId: exercises[0]._id },
        { exerciseId: exercises[1]._id },
        { exerciseId: exercises[2]._id },
        { exerciseId: exercises[5]._id },
      ],
      gymId: gym?._id,
      createdBy: owner?._id,
      points: 200,
      status: "Actif",
      isApproved: true,
    },
    {
      name: "Swimming Marathon",
      description: "Natation intense - 10 sessions d'1h minimum",
      difficulty: "Intermédiaire",
      duration: { value: 3, unit: "semaine" },
      exercises: [{ exerciseId: exercises[6]._id }],
      gymId: gym?._id,
      createdBy: owner?._id,
      points: 120,
      status: "Actif",
      isApproved: true,
    },
    {
      name: "Deadlift Master",
      description: "Progressez en deadlift - technique et puissance",
      difficulty: "Avancé",
      duration: { value: 4, unit: "semaine" },
      exercises: [{ exerciseId: exercises[4]._id }],
      gymId: gym?._id,
      createdBy: owner?._id,
      points: 150,
      status: "Terminé",
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

async function seedUserChallenges(
  users: any[],
  challenges: any[]
) {
  const customers = users.filter((u) => u.role === UserRole.CUSTOMER);
  const userChallenges = [];

  // Créer des participations variées pour avoir un bon leaderboard
  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i];
    const numChallenges = Math.floor(Math.random() * 4) + 2; // 2-5 défis par user

    for (let j = 0; j < numChallenges; j++) {
      const challenge = challenges[j % challenges.length];
      const isCompleted = Math.random() > 0.3; // 70% de complétion

      userChallenges.push({
        userId: customer._id,
        challengeId: challenge._id,
        pointsEarned: isCompleted ? challenge.points : 0,
        completedAt: isCompleted
          ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          : undefined,
      });
    }
  }

  try {
    const created = await UserChallengeModel.insertMany(userChallenges);
    console.log(`✅ ${created.length} participations aux défis créées`);
    return created;
  } catch (error) {
    console.error("❌ Erreur création participations:", error);
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
    const gyms = await seedGyms(users);
    const badges = await seedBadges(users);
    const rewards = await seedRewards(users);
    const challenges = await seedChallenges(users, exercises, gyms);
    const userChallenges = await seedUserChallenges(users, challenges);

    console.log("\n✨ Data terminé avec succès!");
    console.log("\n📋 Données créées:");
    console.log(`   - Utilisateurs: ${users.length}`);
    console.log(`   - Exercices: ${exercises.length}`);
    console.log(`   - Salles: ${gyms.length}`);
    console.log(`   - Badges: ${badges.length}`);
    console.log(`   - Récompenses: ${rewards.length}`);
    console.log(`   - Défis: ${challenges.length}`);
    console.log(`   - Participations: ${userChallenges.length}`);

    console.log("\n🔑 Comptes de Test:");
    console.log("   ADMIN:    admin@fitness.com / admin123");
    console.log("   OWNER:    owner@fitnessgym.com / owner123");
    console.log("   CUSTOMER: jean.dupont@email.com / customer123");
    console.log("   CUSTOMER: marie.martin@email.com / customer123");
    console.log("   CUSTOMER: pierre.bernard@email.com / customer123");
    console.log("   CUSTOMER: sophie.laurent@email.com / customer123");
    console.log("   CUSTOMER: thomas.moreau@email.com / customer123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur durant le data:", error);
    process.exit(1);
  }
}

main();
