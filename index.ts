import express from "express";
import {
  HealthCheckController,
  GymController,
  ExerciseController,
  UserController,
  AuthController,
  ChallengeController,
  BadgeController,
  RewardController,
  LeaderboardController,
} from "./controllers";
import { openMongooseConnection } from "./services";
import {
  GymService,
  ExerciseService,
  UserService,
  ChallengeService,
  UserChallengeService,
  SharedChallengeService,
  BadgeService,
  RewardService,
  LeaderboardService,
} from "./services/mongoose/services";
import { AuthService } from "./services/mongoose/services/Auth";
import { config } from "dotenv";
import { UserRole } from "./models";

config(); // LOAD ENV VAR

async function main() {
  const mongooseConnection = await openMongooseConnection();
  const userService = new UserService(mongooseConnection);
  const gymService = new GymService(mongooseConnection);
  const exerciseService = new ExerciseService(mongooseConnection);
  const authService = new AuthService(userService);
  const challengeService = new ChallengeService(mongooseConnection);
  const userChallengeService = new UserChallengeService(mongooseConnection);
  const sharedChallengeService = new SharedChallengeService(mongooseConnection);


  const app = express();
  app.use(express.json()); // pour la compréhension de postman

  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  const healthCheckController = new HealthCheckController();
  const gymController = new GymController(gymService, userService);
  const exerciseController = new ExerciseController(exerciseService);
  const userController = new UserController(userService);
  const authController = new AuthController(authService);
  const challengeController = new ChallengeController(
    gymService,
    challengeService,
    userChallengeService,
    sharedChallengeService
  );

  const badgeService = new BadgeService();
  const rewardService = new RewardService();
  const leaderboardService = new LeaderboardService(mongooseConnection);
  const badgeController = new BadgeController(badgeService);
  const rewardController = new RewardController(rewardService);
  const leaderboardController = new LeaderboardController(leaderboardService);

  app.use("/health-check", healthCheckController.buildRouter());
  app.use("/gym", gymController.buildRouter());
  app.use("/exercise", exerciseController.buildRouter());
  app.use("/user", userController.buildRouter());
  app.use("/auth", authController.buildRouter());
  app.use("/owner", challengeController.buildRouter());
  app.use("/challenge", challengeController.buildRouter());
  app.use("/badge", badgeController.buildRouter());
  app.use("/reward", rewardController.buildRouter());
  app.use("/leaderboard", leaderboardController.buildRouter());

  app.listen(process.env.PORT || 3000, () =>
    console.log(`Server listening on port ${process.env.PORT || 3000}!`)
  );
}

main().catch(console.error);
