import mongoose from "mongoose";

const snackSchema = new mongoose.Schema(
  {

    name: {
      type: String,
      required: true,
      trim: true,
    },
    desc: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ["Snack", "Drink", "Water"],
      default: "Snack",
    },
    image: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Snack", snackSchema);
