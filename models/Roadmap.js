// models/Roadmap.js (ESM)
import mongoose from "mongoose";

const RoadmapSchema = new mongoose.Schema({
  topic: String,
  steps: [String],
});

export default mongoose.model("Roadmap", RoadmapSchema);
