import { Mongoose, Model } from "mongoose";
import { Exercise, Challenge } from "../../../models";
import { ExerciseModel, ChallengeModel } from "../schema/";

export class ChallengeService {
  readonly exerciseModel: Model<Exercise>;
  readonly challengeModel: Model<Challenge>;

  constructor(readonly connection: Mongoose) {
    this.exerciseModel = ExerciseModel;
    this.challengeModel = ChallengeModel;
  }

  async createChallenge(data: Challenge) {
    return this.challengeModel.create({
      ...data,
    });
  }
}
