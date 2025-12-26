import {Mongoose, Model} from "mongoose";
import {User} from "../../../models";
import {getUserSchema} from "../schema/user.schema";
import {sha256} from "../../../utils";

export type CreateUser = Omit<User, '_id'>;

export class UserService {

    readonly userModel: Model<User>;

    constructor(readonly connection: Mongoose) {
        this.userModel = connection.model('User', getUserSchema());
    }

    async createUser(user: CreateUser): Promise<User> {
        return this.userModel.create({...user, password: sha256(user.password)});
    }

    async findUser(login: string): Promise<User | null> {
        return this.userModel.findOne({ login });
    }
}