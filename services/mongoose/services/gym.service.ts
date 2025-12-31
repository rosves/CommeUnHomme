import { Mongoose, Model } from "mongoose";
import { Gym, UserRole } from "../../../models"; 
import { getGymSchema } from "../schema/gym.schema";

export class GymService {
    readonly gymModel: Model<Gym>;

    constructor(readonly connection: Mongoose) {
        this.gymModel = connection.model('Gym', getGymSchema());
    }

    async createGym(data: Omit<Gym, '_id' | 'isApproved'>, userRole: string): Promise<Gym> {
        return this.gymModel.create({
            ...data,
            isApproved: userRole === UserRole.ADMIN 
        });
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