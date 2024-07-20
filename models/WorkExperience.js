import mongoose from "mongoose";
const WorkexperienceSchema = new mongoose.Schema({
    workName: String, 
    CompanyName:String, 
    Details:String,
    Year:String,
},
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
)
export default mongoose.model("workExperience", WorkexperienceSchema);