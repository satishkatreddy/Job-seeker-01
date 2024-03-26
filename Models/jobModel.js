const mongoose = require('mongoose');
const schema = mongoose.Schema


const jobSchema = new schema(
  {
    company: {
      type: mongoose.Types.ObjectId,
      ref: "Companies"
    },
    jobTitle: {
      type: String, required: [true, "Job Title is required"]
    },
    jobType: {
      type: String, required: [true, "Job Type is required"]
    },
    location: {
      type: String, required: [true, "Location is required"]
    },
    salary: {
      type: Number, required: [true, "Salary is required"]
    },
    vacancies: {
      type: Number
    },
    experience: {
      type: Number, default: 0
    },
    detail: [
      { desc: { type: String }, requirements: { type: String } }
    ],
    application: [
      { type: mongoose.Types.ObjectId, ref: "Users" }
    ],
  },
  { timestamps: true }
);

const Jobs = mongoose.model("Jobs", jobSchema);
module.exports = Jobs;