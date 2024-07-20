import mongoose from "mongoose"
const worksSchema = new mongoose.Schema({
  title: String,
  description: String,
  projectLink: String,
  codeLink: String,
  imageUrl: String,
  tags: {
    type: Array,
    default: 'All'
  }
});

export default mongoose.model('work', worksSchema);

