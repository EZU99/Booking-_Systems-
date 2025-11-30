import Snack from "../models/Snack.js";
import cloudinary from "../configs/cloudinary.js";

/**
 * Create a snack (expects multipart/form-data with image file in req.files.image)
 */
export const createSnack = async (req, res, next) => {
  try {
    const { name, desc, price, type } = req.body;

    // validate fields
    if (!name || !desc || !price) {
      return res.status(400).json({ success: false, message: "name, desc and price are required" });
    }

    // ensure image present
    if (!req.files || !req.files.image) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const image = req.files.image;

    if (!image.mimetype.startsWith("image/")) {
      return res.status(400).json({ success: false, message: "Uploaded file must be an image" });
    }

    // upload to Cloudinary (using tempFilePath provided by express-fileupload)
    const cloudinaryResponse = await cloudinary.uploader.upload(image.tempFilePath, {
      folder: "Snacks",
    });

    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.error("Cloudinary upload error:", cloudinaryResponse?.error || "unknown");
      return res.status(500).json({ success: false, message: "Image upload failed" });
    }

    // create document in DB
    const snack = await Snack.create({
      name,
      desc,
      price: Number(price),
      type: type,
      image: {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      },
    });

    return res.status(201).json({ success: true, snack });
  } catch (err) {
    console.error("createSnack error:", err);
    return next(err); // or res.status(500).json({ success: false, message: err.message })
  }
};

/**
 * Update snack by id (param: :id)
 * Can update fields and optionally replace image via req.files.image
 */
export const updateSnack = async (req, res, next) => {
  try {
    const snackIdParam = req.params.id;
    if (!snackIdParam) return res.status(400).json({ success: false, message: "Snack id required in params" });

    // find snack - try _id first, then id field
    let snack = await Snack.findById(snackIdParam);
    if (!snack) snack = await Snack.findOne({ id: snackIdParam });
    if (!snack) return res.status(404).json({ success: false, message: "Snack not found" });

    // Build update object
    const newSnackData = {};
    if (req.body.name) newSnackData.name = req.body.name;
    if (req.body.desc) newSnackData.desc = req.body.desc;
    if (req.body.price !== undefined) newSnackData.price = Number(req.body.price);
    if (req.body.type) newSnackData.type = req.body.type;

    // If new image provided, delete old one and upload the new one
    if (req.files && req.files.image) {
      const imageFile = req.files.image;

      if (!imageFile.mimetype.startsWith("image/")) {
        return res.status(400).json({ success: false, message: "Uploaded file must be an image" });
      }

      // delete old image from Cloudinary (if exists)
      try {
        if (snack.image && snack.image.public_id) {
          await cloudinary.uploader.destroy(snack.image.public_id);
        }
      } catch (err) {
        console.warn("Could not delete old Cloudinary image:", err);
        // continue anyway
      }

      // upload new image
      const uploadRes = await cloudinary.uploader.upload(imageFile.tempFilePath, {
        folder: "Snacks",
      });

      if (!uploadRes || uploadRes.error) {
        console.error("Cloudinary upload error:", uploadRes?.error || "unknown");
        return res.status(500).json({ success: false, message: "Image upload failed" });
      }

      newSnackData.image = {
        public_id: uploadRes.public_id,
        url: uploadRes.secure_url,
      };
    }

    const updatedSnack = await Snack.findByIdAndUpdate(snack._id, newSnackData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ success: true, snack: updatedSnack });
  } catch (err) {
    console.error("updateSnack error:", err);
    return next(err);
  }
};

/**
 * Delete a snack by id and remove its image from Cloudinary
 */
export const deleteSnack = async (req, res, next) => {
  try {
    const snackIdParam = req.params.id;
    if (!snackIdParam) return res.status(400).json({ success: false, message: "Snack id required " });

    // find snack
    let snack = await Snack.findById(snackIdParam);
    if (!snack) snack = await Snack.findOne({ id: snackIdParam });
    if (!snack) return res.status(404).json({ success: false, message: "Snack not found" });

    // delete image from Cloudinary
    try {
      if (snack.image && snack.image.public_id) {
        await cloudinary.uploader.destroy(snack.image.public_id);
      }
    } catch (err) {
      console.warn("Could not delete image from Cloudinary:", err);
      // do not block deletion of DB record if cloudinary fails
    }

    // remove from DB
    await Snack.findByIdAndDelete(snack._id);

    return res.status(200).json({ success: true, message: "Snack deleted" });
  } catch (err) {
    console.error("deleteSnack error:", err);
    return next(err);
  }
};

/**
 * Get all snacks
 */
export const getAllSnacks = async (req, res, next) => {
  try {
    const snacks = await Snack.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, snacks });
  } catch (err) {
    console.error("getAllSnacks error:", err);
    return next(err);
  }
};

/**
 * Get one snack by id
 */
export const getSnack = async (req, res, next) => {
  try {
    const snackIdParam = req.params.id;
    let snack = await Snack.findById(snackIdParam);
    if (!snack) snack = await Snack.findOne({ id: snackIdParam });
    if (!snack) return res.status(404).json({ success: false, message: "Snack not found" });
    return res.status(200).json({ success: true, snack });
  } catch (err) {
    console.error("getSnack error:", err);
    return next(err);
  }
};
