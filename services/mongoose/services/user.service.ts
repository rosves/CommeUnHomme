import { Mongoose, Model } from "mongoose";
import { User } from "../../../models";
import { UserModel } from "../schema/";

export class UserService {
  readonly userModel: Model<User>;

  constructor(readonly connection: Mongoose) {
    this.userModel = UserModel;
  }

  async createUser(data: User): Promise<User> {
    return this.userModel.create({ ...data });
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select("-password");
  }

  async findUser(login: string): Promise<User | null> {
    return this.userModel.findOne({ login });
  }
}
