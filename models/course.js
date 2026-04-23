const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor is required"],
    },
    category: {
      type: String,
      enum: ["HealthProgram", "ProfessionalCourse"],
      required: [true, "Category is required"],
    },
    targetAudience: {
      type: String,
      enum: ["Patient", "Doctor", "Laboratory", "Pharmacy", "Student", "Instructor", "Both", "All"],
      required: [true, "Target audience is required"],
    },
    healthConditions: [String],
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    duration: {
      type: Number, // Hours
    },
    modules: [
      {
        title: String,
        description: String,
        order: Number,
        lessons: [
          {
            title: String,
            content: String,
            videoUrl: String,
            duration: Number,
            order: Number,
            resources: [
              {
                title: String,
                url: String,
                type: String,
              },
            ],
          },
        ],
        quiz: {
          questions: [
            {
              question: String,
              options: [String],
              correctAnswer: Number,
              explanation: String,
            },
          ],
          passingScore: Number,
        },
      },
    ],
    thumbnail: String,
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", CourseSchema);
