import { Mongoose, Model } from "mongoose";
import { User } from "../../../models";
import { getUserSchema } from "../schema/user.schema";

export class UserService {
    readonly userModel: Model<User>;

    constructor(readonly connection: Mongoose) {
        this.userModel = connection.model('User', getUserSchema());
    }

    async createUser(data: User): Promise<User> {
        return this.userModel.create(data);
    }

    async findAll(): Promise<User[]> {
        return this.userModel.find().select('-password'); // On cache le password
    }

    async findUser(login: string): Promise<User | null> {
        return this.userModel.findOne({ login });
    }
}