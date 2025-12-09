import cloudinary from "../configs/cloudinary.js";
import ManualMovie from "../models/ManualMovie.js";

export const addMovies = async (req, res, next) => {
  try {
    const { title, overview, release_date, original_language, runtime, vote_average, tagline } = req.body;

   
// === Parse Genres from comma-separated text ===
const genresText = req.body.genres_text; // e.g. "Action, Adventure, Sci-Fi"

if (!genresText || !genresText.trim()) {
  return res.status(400).json({ success: false, message: "Genres are required" });
}

// Optional: clean up spacing
const genres = genresText
  .split(",")            // split by comma
  .map(g => g.trim())    // remove extra spaces
  .filter(Boolean)       // remove empty entries
  .join(", ");           // join back as a single string "Action, Adventure, Sci-Fi"



    if (!title || !overview || !release_date || !runtime || genres.length === 0)
      return res.status(400).json({ success: false, message: "Missing required fields." });

    // === Validate Poster ===
    if (!req.files || !req.files.backdrop_path)
      return res.status(400).json({ success: false, message: "Poster image required." });

    const backdrop_path = req.files.backdrop_path;
    if (!backdrop_path.mimetype.startsWith("image/"))
      return res.status(400).json({ success: false, message: "Poster must be an image." });

    // === Upload Poster ===
    let posterUpload;
    try {
      posterUpload = await cloudinary.uploader.upload(backdrop_path.tempFilePath, {
        folder: "MOVIE_POSTER",
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Poster upload failed.", error: err.message });
    }

    // === Upload Trailer (optional) ===
    let trailerData = { public_id: "", url: "" };
    if (req.files && req.files.trailer) {
      try {
        const trailerUpload = await cloudinary.uploader.upload(req.files.trailer.tempFilePath, {
          folder: "MOVIE_TRAILER",
          resource_type: "video",
        });
        trailerData = { public_id: trailerUpload.public_id, url: trailerUpload.secure_url };
      } catch (err) {
        console.warn("Trailer upload failed, continuing without it.", err.message);
      }
    }

    // === Handle Casts ===
    const casts = [];
    let rawCasts = [];
    try {
      rawCasts = req.body.casts ? JSON.parse(req.body.casts) : [];
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid casts JSON." });
    }

    for (let i = 0; i < rawCasts.length; i++) {
      const cast = rawCasts[i];
      const castKey = `castsImage_${i}`;
      let castsImage = { public_id: "", url: "" };

      if (req.files && req.files[castKey]) {
        try {
          const castUpload = await cloudinary.uploader.upload(req.files[castKey].tempFilePath, {
            folder: "MOVIE_CASTS",
          });
          castsImage = { public_id: castUpload.public_id, url: castUpload.secure_url };
        } catch (err) {
          console.warn(`Cast image upload failed for ${cast.name}, skipping image.`, err.message);
        }
      }

      casts.push({ name: cast.name, castsImage });
    }

    // === Save to ManualMovie ===
    const manualMovie = await ManualMovie.create({
      title,
      overview,
      backdrop_path: {
        public_id: posterUpload.public_id,
        url: posterUpload.secure_url,
      },
      trailer: trailerData,
      release_date,
      original_language,
      tagline: tagline || "",
      genres,
      casts,
      vote_average,
      runtime,
    });

    return res.status(201).json({
      success: true,
      message: "Manual movie added successfully.",
      manualMovie,
    });
  } catch (err) {
    console.error("Add Manual Movie Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};





// ✅ Get All Manual Movies
export const getManualMovies = async (req, res) => {
  try {
    const movies = await ManualMovie.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      movies,
    });
  } catch (err) {
    console.error("Error fetching manual movies:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ✅ Get Single Manual Movie by ID
export const getManualMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Movie ID is required" });
    }

    const movie = await ManualMovie.findById(id);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Manual movie not found" });
    }

    return res.status(200).json({ success: true, movie });
  } catch (err) {
    console.error("Get Manual Movie by ID error:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error while fetching movie" });
  }
};




// ✅ Get all manual shows
export const getManualShows = async (req, res) => {
  try {
    const shows = await ManualShow.find({ showDateTime: { $gte: new Date() } })
      .populate("movie")
      .sort({ showDateTime: 1 });

    res.status(200).json({ success: true, shows });
  } catch (err) {
    console.error("Get Manual Shows Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get shows for one manual movie
export const getManualMovieShows = async (req, res) => {
  try {
    const { movieId } = req.params;

    const shows = await ManualShow.find({
      movie: movieId,
      showDateTime: { $gte: new Date() },
    }).sort({ showDateTime: 1 });

    res.status(200).json({ success: true, shows });
  } catch (err) {
    console.error("Get Manual Movie Shows Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

