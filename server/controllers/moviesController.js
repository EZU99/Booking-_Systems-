import cloudinary from "../configs/cloudinary.js";
import ManualMovie from "../models/ManualMovie.js";
import ManualShow from "../models/ManualShow.js"
import Movie from "../models/Movie.js";
// ✅ Add Manual Movie
export const addMovies = async (req, res, next) => {
  try {
    const { title, overview, release_date, original_language, runtime, vote_average, tagline } = req.body;

    // === Parse Genres ===
    const rawGenres = req.body.genres ?? req.body.genres_json ?? req.body["genres[]"];
    let genres = [];
    if (Array.isArray(rawGenres)) genres = rawGenres.map((g) => String(g).trim());
    else if (typeof rawGenres === "string")
      genres = rawGenres.split(",").map((g) => g.trim());

    if (!title || !overview || !release_date || !runtime || genres.length === 0)
      return res.status(400).json({ success: false, message: "Missing required fields." });

    // === Validate Poster ===
    if (!req.files || !req.files.backdrop_path)
      return res.status(400).json({ success: false, message: "Poster image required." });

    const backdrop_path = req.files.backdrop_path;
    if (!backdrop_path.mimetype.startsWith("image/"))
      return res.status(400).json({ success: false, message: "Poster must be an image." });

    // === Upload Files to Cloudinary ===
    const posterUpload = await cloudinary.uploader.upload(backdrop_path.tempFilePath, {
      folder: "MOVIE_POSTER",
    });

    // Trailer (optional)
    let trailerData = null;
    if (req.files && req.files.trailer) {
      const trailerUpload = await cloudinary.uploader.upload(req.files.trailer.tempFilePath, {
        folder: "MOVIE_TRAILER",
        resource_type: "video",
      });
      trailerData = { public_id: trailerUpload.public_id, url: trailerUpload.secure_url };
    }

    // === Handle Casts ===
    const casts = [];
    const rawCasts = req.body.casts ? JSON.parse(req.body.casts) : [];
    for (let i = 0; i < rawCasts.length; i++) {
      const cast = rawCasts[i];
      const castKey = `castsImage_${i}`;
      let castsImage = { public_id: "", url: "" };

      if (req.files && req.files[castKey]) {
        const castUpload = await cloudinary.uploader.upload(req.files[castKey].tempFilePath, {
          folder: "MOVIE_CASTS",
        });
        castsImage = { public_id: castUpload.public_id, url: castUpload.secure_url };
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
      trailer: trailerData || { public_id: "", url: "" },
      release_date,
      original_language,
      tagline: tagline || "",
      genres,
      casts,
      vote_average,
      runtime,
    });

    // === Also Save a Flat Copy to Movie DB ===
    const simpleCasts = casts.map((c) => ({
      name: c.name,
      profile_path: c.castsImage.url,
    }));

    const movieCopy = {
      _id: manualMovie._id.toString(), // same ID
      title,
      overview,
      poster_path: posterUpload.secure_url,
      backdrop_path: posterUpload.secure_url,
      release_date,
      tagline: tagline || "",
      genres,
      casts: simpleCasts,
      vote_average,
      runtime,
      original_language,
    };

    await Movie.create(movieCopy);

    return res.status(201).json({
      success: true,
      message: "Manual movie added successfully and synced with Movie DB.",
      manualMovie,
      syncedMovie: movieCopy,
    });
  } catch (err) {
    console.error("Add Manual Movie Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


export const addManualShow = async (req, res) => {
  try {
    const { movieId, showsInput, price, type } = req.body;

    // 🧱 Validate input
    if (!movieId || !showsInput || !price) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (movieId, showsInput, price).",
      });
    }

    // 🧩 Parse JSON if coming as string
    let parsedShows = showsInput;
    let parsedPrice = price;
    if (typeof showsInput === "string") {
      try { parsedShows = JSON.parse(showsInput); } catch (err) {}
    }
    if (typeof price === "string") {
      try { parsedPrice = JSON.parse(price); } catch (err) {}
    }

    // 🎥 Ensure the manual movie exists
    const movie = await ManualMovie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Manual movie not found.",
      });
    }

    // 🎬 Prepare show documents
    const showsToCreate = [];

    for (const show of parsedShows) {
      const { hall, date, times } = show;
      if (!hall || !date || !Array.isArray(times)) continue;

      for (const time of times) {
        const showDateTime = new Date(`${date}T${time}`);

        // 🧩 Prevent duplicates (same movie + hall + datetime)
        const exists = await Show.exists({
          movie: movie._id.toString(),
          hall,
          showDateTime,
        });

        if (!exists) {
          showsToCreate.push({
            movie: movie._id.toString(), // ref to ManualMovie
            hall,
            type: type || "2D",
            showDateTime,
            showPrice: {
              regular: parsedPrice.regular,
              vip: parsedPrice.vip,
            },
            occupiedSeats: { regular: [], vip: [] },
          });
        }
      }
    }

    if (showsToCreate.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No new shows to add (duplicates skipped).",
      });
    }

    // 💾 Save shows into Show collection
    await Show.insertMany(showsToCreate);

    res.status(201).json({
      success: true,
      message: "Manual movie shows added successfully.",
      totalShowsAdded: showsToCreate.length,
      movieTitle: movie.title,
    });
  } catch (error) {
    console.error("Add Manual Show Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while adding manual shows.",
    });
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

