import mongoose from "mongoose";
const SkillSchema = new mongoose.Schema({
    Name: String,
    bgColor: String,
    Icon: String,
},
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    });
export default mongoose.model("skill", SkillSchema);