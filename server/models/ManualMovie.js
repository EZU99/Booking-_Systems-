import mongoose from "mongoose";

const manualMovieSchema = new mongoose.Schema(
  {
          
    title: { type: String, required: true },
    overview: { type: String, required: true },

    // Cloudinary upload
    backdrop_path: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },

    // Optional trailer
    trailer: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },

    release_date: { type: String, required: true },
    original_language: { type: String, default: "en" },

    tagline: { type: String },
    genres: { type: Array, required: true },

    // Casts array with optional images
     casts: [
      {
        name: { type: String, required: true },
        castsImage: { // 👈 changed here
          public_id: { type: String, required: true },
          url: { type: String, required: true },
        },
      },
    ],

    vote_average: { type: Number, default: 0 },
    runtime: { type: Number, required: true },
  },
  { timestamps: true }
);

const ManualMovie = mongoose.model("ManualMovie", manualMovieSchema);
export default ManualMovie;