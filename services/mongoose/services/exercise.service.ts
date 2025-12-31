import { Mongoose, Model } from "mongoose";
import { Exercise } from "../../../models";
import { getExerciseSchema } from "../schema/exercise.schema";

export class ExerciseService {
    readonly exerciseModel: Model<Exercise>;

    constructor(readonly connection: Mongoose) {
        this.exerciseModel = connection.model('Exercise', getExerciseSchema());
    }

    async createExercise(data: Exercise): Promise<Exercise> {
        return this.exerciseModel.create(data);
    }

    async updateExercise(id: string, data: Partial<Exercise>): Promise<Exercise | null> {
        return this.exerciseModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteExercise(id: string): Promise<boolean> {
        const result = await this.exerciseModel.findByIdAndDelete(id);
        return !!result;
    }

    async findAll(): Promise<Exercise[]> {
        return this.exerciseModel.find();
    }
}