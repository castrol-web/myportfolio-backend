import mongoose from "mongoose";

const TestimonialSchema = new mongoose.Schema({
    name: String,
    Company:String,
    ImageUrl:String,
    Feedback:String,
})




export default mongoose.model("testimonial", TestimonialSchema);