import { Mongoose, Model } from "mongoose";
import { Gym, UserRole, User } from "../../../models";
import { GymModel, UserModel } from "../schema/";

export class GymService {
  readonly gymModel: Model<Gym>;
  readonly userModel: Model<User>;

  constructor(readonly connection: Mongoose) {
    this.gymModel = GymModel;
    this.userModel = UserModel;
  }

  async createGym(
    data: Omit<Gym, "_id" | "isApproved">,
    userRole: string
  ): Promise<Gym> {
    return this.gymModel.create({
      ...data,
      isApproved: userRole === UserRole.ADMIN,
    });
  }

  async changeInformation(
    gymId: string,
    Data: Partial<Gym>
  ): Promise<Gym | null> {
    return this.gymModel.findByIdAndUpdate(
      gymId,
      { $set: Data },
      { new: true, runValidators: true }
    );
  }

  async approve(gymId: string): Promise<Gym | null> {
    return this.gymModel.findByIdAndUpdate(
      gymId,
      { isApproved: true },
      { new: true }
    );
  }

  async findApprovedGyms(): Promise<Gym[]> {
    return this.gymModel.find({ isApproved: true });
  }

  async findAll(): Promise<Gym[]> {
    return this.gymModel.find();
  }

  async findByName(gymName: string): Promise<Gym | null> {
    return this.gymModel.findOne({ name: gymName });
  }

  async findByOwner(id: string | undefined): Promise<Gym[] | null> {
    return this.gymModel.find({ ownerId: id });
  }

  async findById(id: string): Promise<Gym | null> {
    return this.gymModel.findById(id);
  }

  async updateGym(gymId: string, data: Partial<Gym>): Promise<Gym | null> {
    return this.gymModel.findByIdAndUpdate(gymId, data, { new: true });
  }

  async deleteGym(gymId: string): Promise<boolean> {
    const result = await this.gymModel.findByIdAndDelete(gymId);
    return !!result;
  }
}
