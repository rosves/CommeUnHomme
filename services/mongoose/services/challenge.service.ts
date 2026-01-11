import mongoose from "mongoose";
import { Mongoose, Model, Types } from "mongoose";
import { Exercise, Challenge, StatusChallenge } from "../../../models";
import { ExerciseModel, ChallengeModel } from "../schema/";

export class ChallengeService {
  readonly exerciseModel: Model<Exercise>;
  readonly challengeModel: Model<Challenge>;

  constructor(readonly connection: Mongoose) {
    this.exerciseModel = ExerciseModel;
    this.challengeModel = ChallengeModel;
  }

  async createChallenge(data: Partial<Challenge>): Promise<Challenge | null> {
    return this.challengeModel.create({
      ...data,
    });
  }

  async getChallenge(
    id: Types.ObjectId | undefined
  ): Promise<Challenge[] | null> {
    return this.challengeModel.find({ gymId: id });
  }

  async getActiveChallenge(
    id: Types.ObjectId | undefined
  ): Promise<Challenge[] | null> {
    return this.challengeModel.find({
      gymId: id,
      status: StatusChallenge.ACTIVE,
    });
  }

  async removeChallenge(id: Types.ObjectId | undefined) {
    return this.challengeModel.findOneAndDelete({
      gymId: id,
    });
  }

  async deleteChallenge(id: string | undefined): Promise<boolean> {
    const result = await this.challengeModel.findByIdAndDelete(id);
    return !!result;
  }

  async getChallengeById(id: string | undefined): Promise<Challenge | null> {
    return this.challengeModel.findOne(new mongoose.Types.ObjectId(id));
  }

  async updateChallenge(
    id: string,
    data: Partial<Challenge>
  ): Promise<Challenge | null> {
    return this.challengeModel.findByIdAndUpdate(id, data, { new: true });
  }
}
