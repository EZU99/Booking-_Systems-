import cloudinary from "../configs/cloudinary.js";
import Upcoming from "../models/Upcoming.js";

//  Add Upcoming Movie
//  Robust addUpcoming controller — replace your existing function with this
export const addUpcoming = async (req, res, next) => {
  try {
    const { title, description, release_date, come_date, language, runtime, trailer } = req.body;

    // === normalize genres ===
    const rawGenres =
      req.body.genres ?? req.body.genres_json ?? req.body["genres[]"] ?? req.body["genres"];

    let genres = [];
    if (Array.isArray(rawGenres)) {
      genres = rawGenres.map((g) => String(g).trim()).filter(Boolean);
    } else if (typeof rawGenres === "string" && rawGenres.length) {
      try {
        const parsed = JSON.parse(rawGenres);
        if (Array.isArray(parsed)) genres = parsed.map((g) => String(g).trim()).filter(Boolean);
        else genres = String(parsed).split(",").map((g) => g.trim()).filter(Boolean);
      } catch {
        genres = String(rawGenres).split(",").map((g) => g.trim()).filter(Boolean);
      }
    }

    // === validation ===
    if (
      !title ||
      !description ||
      !release_date ||
      !come_date ||
      !language ||
      !runtime ||
      genres.length === 0 ||
      !trailer //  ensure trailer (YouTube link) is required
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required (including trailer and at least one genre)." });
    }

    //  Optional: check if trailer is a valid YouTube link
    const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//;
    if (!youtubeRegex.test(trailer)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid YouTube trailer link." });
    }

    // === Poster (backdrop) upload ===
    if (!req.files || !req.files.backdrop_path) {
      return res.status(400).json({ success: false, message: "Poster (backdrop_path) is required." });
    }
    const backdrop_path = req.files.backdrop_path;
    if (!backdrop_path.mimetype.startsWith("image/")) {
      return res.status(400).json({ success: false, message: "Uploaded poster must be an image." });
    }

    const posterUpload = await cloudinary.uploader.upload(backdrop_path.tempFilePath, {
      folder: "POSTER",
    });

    // === Casts (optional) ===
    const castsList = [];
    if (req.body.casts) {
      try {
        const parsedCasts = typeof req.body.casts === "string" ? JSON.parse(req.body.casts) : req.body.casts;
        if (Array.isArray(parsedCasts)) castsList.push(...parsedCasts);
      } catch {}
    }

    const castsArray = [];
    for (let i = 0; i < castsList.length; i++) {
      const cast = castsList[i];
      const fileKey = `castsImage_${i}`;
      let castData = { name: cast.name };

      if (req.files && req.files[fileKey]) {
        const imgUp = await cloudinary.uploader.upload(req.files[fileKey].tempFilePath, { folder: "CASTS" });
        castData.castsImage = { public_id: imgUp.public_id, url: imgUp.secure_url };
      }

      castsArray.push(castData);
    }

    // === Create DB record ===
    const upcoming = await Upcoming.create({
      title,
      description,
      release_date,
      come_date,
      language,
      genres,
      runtime,
      backdrop_path: { public_id: posterUpload.public_id, url: posterUpload.secure_url },
      casts: castsArray,
      trailer, //  now required and validated
    });

    const genres_text = genres.join(", ");

    return res.status(201).json({
      success: true,
      message: "Upcoming movie added successfully",
      upcoming,
      genres_text,
    });

  } catch (err) {
    console.error("Add Upcoming error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error while adding upcoming movie",
    });
  }
};



//  Get All Upcomings
export const getUpcomings = async (req, res, next) => {
  try {
    const upcoming = await Upcoming.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, upcoming });
  } catch (error) {
    console.error("Get all Upcoming Movies:", error);
    return next(error);
  }
};

//  Delete Upcoming
export const deleteUpcoming = async (req, res, next) => {
  try {
    const upcomingIdParam = req.params.id; // fixed from res.params.id → req.params.id

    if (!upcomingIdParam)
      return res.json({
        success: false,
        message: "Unknown upcoming movie ID",
      });

    const upcoming = await Upcoming.findById(upcomingIdParam);
    if (!upcoming)
      return res.json({
        success: false,
        message: "Upcoming movie not found",
      });

    //  Delete images from Cloudinary
    await cloudinary.uploader.destroy(upcoming.backdrop_path.public_id);

    if (upcoming.trailer?.public_id) {
      await cloudinary.uploader.destroy(upcoming.trailer.public_id, {
        resource_type: "video",
      });
    }

    for (const cast of upcoming.casts) {
      if (cast.castsImage?.public_id) {
        await cloudinary.uploader.destroy(cast.castsImage.public_id);
      }
    }

    await Upcoming.findByIdAndDelete(upcoming._id);
    return res.json({
      success: true,
      message: "Upcoming movie deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};


//  Get single upcoming movie detail
export const getUpcomingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Movie ID is required" });
    }

    const upcoming = await Upcoming.findById(id);

    if (!upcoming) {
      return res.status(404).json({ success: false, message: "Upcoming movie not found" });
    }

    return res.status(200).json({ success: true, upcoming });
  } catch (error) {
    console.error("Get upcoming by ID error:", error);
    return next(error);
  }
};
