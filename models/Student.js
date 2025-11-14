// models/Student.js (ESM)
import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  quiz_marks: Number,
  attendance: Number,
  study_hours: Number,
  predicted: Number,
  probability: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Student", StudentSchema);
