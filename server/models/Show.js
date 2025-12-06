import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: String,
      required: true,
      ref: "Movie",
    },
    showDateTime: {
      type: Date,
      required: true,
    },
    showPrice: {
      regular: { type: Number, required: true },
      vip: { type: Number, required: true },
    },
    hall: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["2D", "3D"], // optional, for safety
      required: true,
    },
    occupiedSeats: {
     regular: { type: [String], default: [] },
    vip: { type: [String], default: [] },
    },
  },
  { minimize: false }
);

const Show = mongoose.model("Show", showSchema);
export default Show;