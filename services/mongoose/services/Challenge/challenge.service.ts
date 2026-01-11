import { Mongoose, Model } from "mongoose";
import mongoose from "mongoose";
import { Types } from "mongoose";
import { Exercise, Challenge, StatusChallenge } from "../../../../models";
import { ExerciseModel, ChallengeModel } from "../../schema";

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

  // Clients
  async findApprovedChallenges(): Promise<Challenge[]> {
    return this.challengeModel
      .find({ isApproved: true, status: 'Actif' })
      .populate('createdBy', 'firstname lastname')
      .populate('exercises.exerciseId', 'name muscleGroup difficulty')
      .populate('gymId', 'name address');
  }

  async findById(id: string): Promise<Challenge | null> {
    return this.challengeModel
      .findById(id)
      .populate('createdBy', 'firstname lastname role')
      .populate('exercises.exerciseId', 'name description muscleGroup difficulty')
      .populate('gymId', 'name address contact equipment');
  }

  async findByCreator(userId: string): Promise<Challenge[]> {
    return this.challengeModel
      .find({ createdBy: userId })
      .populate('exercises.exerciseId', 'name muscleGroup')
      .populate('gymId', 'name');
  }

  async findByGym(gymId: string): Promise<Challenge[]> {
    return this.challengeModel
      .find({ gymId, isApproved: true, status: 'Actif' })
      .populate('createdBy', 'firstname lastname')
      .populate('exercises.exerciseId', 'name muscleGroup');
  }

    async findByDifficulty(difficulty: string): Promise<Challenge[]> {
    return this.challengeModel
      .find({ difficulty, isApproved: true, status: 'Actif' })
      .populate('createdBy', 'firstname lastname')
      .populate('exercises.exerciseId', 'name muscleGroup');
  }

  async findByGoal(goal: string): Promise<Challenge[]> {
    return this.challengeModel
      .find({ goals: goal, isApproved: true, status: 'Actif' })
      .populate('createdBy', 'firstname lastname')
      .populate('exercises.exerciseId', 'name muscleGroup');
  }

async deleteChallenge(id: string): Promise<boolean> {
  const result = await this.challengeModel.findByIdAndDelete(id);
  return !!result;
}

async updateChallenge(id: string, data: Partial<Challenge>): Promise<Challenge | null> {
  return this.challengeModel.findByIdAndUpdate(id, data, { new: true });
}

async approveChallenge(id: string): Promise<Challenge | null> {
  return this.challengeModel.findByIdAndUpdate(
    id,
    { isApproved: true },
    { new: true }
  );
}

  async getChallengeOwner(
    id: Types.ObjectId | undefined
  ): Promise<Challenge[] | null> {
    return this.challengeModel.find({ gymId: id });
  }

  async getActiveChallengeOwner(
    id: Types.ObjectId | undefined
  ): Promise<Challenge[] | null> {
    return this.challengeModel.find({
      gymId: id,
      status: StatusChallenge.ACTIVE,
    });
  }

  async removeChallengeOwner(id: Types.ObjectId | undefined) {
    return this.challengeModel.findOneAndDelete({
      gymId: id,
    });
  }

  async deleteChallengeOwner(id: string | undefined): Promise<boolean> {
    const result = await this.challengeModel.findByIdAndDelete(id);
    return !!result;
  }

  async getChallengeByIdOwner(id: string | undefined): Promise<Challenge | null> {
    return this.challengeModel.findOne(new mongoose.Types.ObjectId(id));
  }

  async updateChallengeOwner(
    id: string,
    data: Partial<Challenge>
  ): Promise<Challenge | null> {
    return this.challengeModel.findByIdAndUpdate(id, data, { new: true });
  }
}


