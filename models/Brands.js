import mongoose from "mongoose";
const BrandsSchema = new mongoose.Schema({
    name: String,
    ImageUrl:String,
});
export default mongoose.model("brand", BrandsSchema);