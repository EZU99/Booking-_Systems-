import React, { useEffect, useState } from "react";
import Title from "./Title";
import { CheckIcon, StarIcon, TrashIcon } from "@heroicons/react/16/solid";
import Loading from "../../components/Loading";
import { kConverter } from "../../lib/kConverter";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const AddShows = () => {
  const { axios, getToken, user, image_base_url } = useAppContext();
  const currency = import.meta.env.VITE_CURENCY;

  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [manualMovies, setManualMovies] = useState([]);
  const [source, setSource] = useState("nowplaying"); // "nowplaying" | "manual"

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [regularPrice, setRegularPrice] = useState("");
  const [vipPrice, setVipPrice] = useState("");
  const [selectedHall, setSelectedHall] = useState("");
  const [movieType, setMovieType] = useState("2D");
  const [addingShow, setAddingShow] = useState(false);

  const hallOptions = ["C1", "C2", "C3"];
  const typeOptions = ["2D", "3D"];

  // 🔹 Fetch now playing movies
  const fetchNowPlayingMovies = async () => {
    try {
      const { data } = await axios.get("/api/show/now-playing", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) setNowPlayingMovies(data.movies || []);
    } catch (error) {
      console.error("Error fetching now playing movies:", error);
      setNowPlayingMovies([]);
    }
  };

  // 🔹 Fetch manual movies (added by admin)
  const fetchManualMovies = async () => {
    try {
      const { data } = await axios.get("/api/show/manual/movies/all", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) setManualMovies(data.movies || []);
    } catch (error) {
      console.error("Error fetching manual movies:", error);
      setManualMovies([]);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNowPlayingMovies();
      fetchManualMovies();
    }
  }, [user]);

  // 🕒 Date-Time Selection
  const handleDateTimeChange = (e) => {
    const value = e.target.value;
    const now = new Date();
    const selected = new Date(value);
    if (selected < now) {
      toast.error("You cannot select a past time!");
      return;
    }
    setDateTimeInput(value);
  };

  const handleDateTimeAdd = () => {
    if (!selectedHall) return toast.error("Please select a hall!");
    if (!dateTimeInput) return toast.error("Please select a date and time!");

    const [date, time] = dateTimeInput.split("T");
    if (!date || !time) return;

    setDateTimeSelection((prev) => {
      const hallData = prev[selectedHall] || {};
      const times = hallData[date] || [];
      if (times.includes(time)) {
        toast.error("This time already exists for the selected hall!");
        return prev;
      }
      return {
        ...prev,
        [selectedHall]: {
          ...hallData,
          [date]: [...times, time],
        },
      };
    });

    setDateTimeInput("");
  };

  const handleRemoveTime = (hall, date, time) => {
    setDateTimeSelection((prev) => {
      const hallData = { ...prev[hall] };
      const filteredTimes = hallData[date].filter((t) => t !== time);
      if (filteredTimes.length === 0) delete hallData[date];
      else hallData[date] = filteredTimes;
      const updated = { ...prev, [hall]: hallData };
      if (Object.keys(hallData).length === 0) delete updated[hall];
      return updated;
    });
  };

  // ✅ Unified show submission
  const handleSubmit = async () => {
    try {
      setAddingShow(true);

      if (!selectedMovie) return toast.error("Please select a movie!");
      if (!regularPrice || !vipPrice)
        return toast.error("Enter both Regular and VIP prices!");
      if (Object.keys(dateTimeSelection).length === 0)
        return toast.error("Add at least one showtime!");

      // Build showsInput
      const showsInput = Object.entries(dateTimeSelection).flatMap(
        ([hall, hallDates]) =>
          Object.entries(hallDates).map(([date, times]) => ({
            hall,
            date,
            times,
          }))
      );

      const payload = {
        movieId: selectedMovie.id,
        movieTitle: selectedMovie.title,
        type: movieType,
        price: {
          regular: Number(regularPrice),
          vip: Number(vipPrice),
        },
        showsInput,
      };

      // ✅ Unified endpoint for both TMDB + Manual
      const { data } = await axios.post("/api/show/add", payload, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        toast.success(data.message || "Shows added successfully!");
        // Reset form
        setSelectedMovie(null);
        setDateTimeSelection({});
        setDateTimeInput("");
        setRegularPrice("");
        setVipPrice("");
        setMovieType("2D");
        setSelectedHall("");
      } else {
        toast.error(data.message || "Failed to add shows.");
      }
    } catch (error) {
      console.error("Add show error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setAddingShow(false);
    }
  };

  const moviesToDisplay = source === "nowplaying" ? nowPlayingMovies : manualMovies;

  if (user && nowPlayingMovies.length === 0 && manualMovies.length === 0)
    return <Loading />;

  return (
    <>
      <Title text1="Add" text2="Shows" />

      {/* Source Tabs */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => setSource("nowplaying")}
          className={`px-4 py-2 rounded ${
            source === "nowplaying"
              ? "bg-primary text-white"
              : "bg-transparent border border-gray-700 text-gray-300"
          }`}
        >
          Now Playing
        </button>
        <button
          onClick={() => setSource("manual")}
          className={`px-4 py-2 rounded ${
            source === "manual"
              ? "bg-primary text-white"
              : "bg-transparent border border-gray-700 text-gray-300"
          }`}
        >
          Manual Movies
        </button>
      </div>

      {/* Movie List */}
      <p className="mt-6 text-lg font-medium">
        {source === "nowplaying" ? "Now Playing Movies" : "Manual Movies"}
      </p>

      <div className="overflow-x-auto pb-4">
        <div className="flex flex-wrap gap-4 mt-4 w-max">
          {moviesToDisplay.map((movie) => {
            const movieId = movie.id ?? movie._id;
            const title = movie.title;
            const posterSrc =
              source === "nowplaying"
                ? image_base_url + movie.poster_path
                : movie.backdrop_path?.url ||
                  image_base_url + movie.poster_path;

            return (
              <div
                key={movieId}
                className={`relative max-w-40 cursor-pointer hover:-translate-y-1 transition duration-300 ${
                  selectedMovie?.id === movieId ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedMovie({ id: movieId, title })}
              >
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={posterSrc}
                    alt={title}
                    className="w-full object-cover brightness-90"
                  />
                  <div className="text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0">
                    <p className="flex items-center gap-1 text-gray-400">
                      <StarIcon className="w-4 h-4 text-primary fill-primary-dull" />
                      {movie.vote_average?.toFixed(1) ?? "N/A"}
                    </p>
                    <p className="text-gray-300">
                      {kConverter(movie.vote_count ?? movie.casts?.length ?? 0)} Votes
                    </p>
                  </div>
                </div>
                {selectedMovie?.id === movieId && (
                  <div className="absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                )}
                <p className="font-medium truncate">{title}</p>
                <p className="text-gray-400 text-sm">
                  {movie.release_date ?? ""}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Movie Type */}
      <div className="mt-8">
        <label className="block text-sm font-medium mb-2">Movie Type</label>
        <select
          value={movieType}
          onChange={(e) => setMovieType(e.target.value)}
          className="border border-gray-600 rounded-lg px-6 py-3 text-sm bg-transparent text-white"
        >
          {typeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Price Fields */}
      <div className="mt-8 flex flex-col md:flex-row gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Regular Price</label>
          <div className="inline-flex items-center gap-2 border border-gray-600 px-4 py-2 rounded-md">
            <p className="text-gray-400 text-sm">{currency}</p>
            <input
              type="number"
              min={0}
              value={regularPrice}
              onChange={(e) => setRegularPrice(e.target.value)}
              placeholder="Enter regular price"
              className="outline-none bg-transparent text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">VIP Price</label>
          <div className="inline-flex items-center gap-2 border border-gray-600 px-4 py-2 rounded-md">
            <p className="text-gray-400 text-sm">{currency}</p>
            <input
              type="number"
              min={0}
              value={vipPrice}
              onChange={(e) => setVipPrice(e.target.value)}
              placeholder="Enter VIP price"
              className="outline-none bg-transparent text-white"
            />
          </div>
        </div>
      </div>

      {/* Hall + Time Selection */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">Select Hall, Date & Time</label>
        <div className="flex flex-wrap items-center gap-5 mb-3">
          <select
            value={selectedHall}
            onChange={(e) => setSelectedHall(e.target.value)}
            className="border border-amber-50 rounded-lg px-6 py-3 text-sm text-primary-dull bg-primary"
          >
            <option value="">Select Hall</option>
            {hallOptions.map((hall) => (
              <option key={hall} value={hall}>
                {hall}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            value={dateTimeInput}
            onChange={handleDateTimeChange}
            className="outline-none rounded-md text-sm"
            min={new Date().toISOString().slice(0, 16)}
          />
          <button
            onClick={handleDateTimeAdd}
            className="bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary cursor-pointer"
          >
            Add Time
          </button>
        </div>
      </div>

      {/* Selected Halls */}
      {Object.keys(dateTimeSelection).length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-lg font-semibold">Selected Hall, Date & Time</h2>
          <p className="text-gray-400 mb-4">🎬 {selectedMovie?.title}</p>
          <ul className="space-y-4">
            {Object.entries(dateTimeSelection).map(([hall, hallData]) => (
              <div
                key={hall}
                className="mb-4 border border-gray-700 rounded-lg p-4 bg-black/30"
              >
                <h3 className="font-semibold text-primary text-lg mb-2">
                  🏛️ Hall: {hall}
                </h3>
                {Object.entries(hallData).map(([date, times]) => (
                  <div key={date} className="flex flex-col gap-2">
                    <div className="font-medium text-gray-300">📅 {date}</div>
                    <div className="flex flex-wrap gap-2 mt-1 text-sm">
                      {times.map((time) => (
                        <div
                          key={time}
                          className="border border-primary px-3 py-1 flex items-center rounded"
                        >
                          ⏰ <span className="ml-1">{time}</span>
                          <TrashIcon
                            onClick={() => handleRemoveTime(hall, date, time)}
                            width={15}
                            className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </ul>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={addingShow}
        className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all disabled:opacity-50"
      >
        {addingShow ? "Adding..." : "Add Show"}
      </button>
    </>
  );
};

export default AddShows;







































export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, price, type } = req.body;

    // 🧱 Validate
    if (!movieId || !showsInput || !price) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (movieId, showsInput, price).",
      });
    }

    // 🧩 Parse JSON strings if needed
    let parsedShows = showsInput;
    let parsedPrice = price;
    if (typeof showsInput === "string") {
      try { parsedShows = JSON.parse(showsInput); } catch {}
    }
    if (typeof price === "string") {
      try { parsedPrice = JSON.parse(price); } catch {}
    }

    // 🎥 Find movie in either Movie or ManualMovie
    let movie = await Movie.findById(movieId);
    if (!movie) {
      movie = await ManualMovie.findById(movieId);
    }

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found in either Movie or ManualMovie collection.",
      });
    }

    // 🎬 Prepare show documents
    const showsToCreate = [];

    for (const show of parsedShows) {
      const { hall, date, times } = show;
      if (!hall || !date || !Array.isArray(times)) continue;

      for (const time of times) {
        const showDateTime = new Date(`${date}T${time}`);

        // Skip duplicates (same movie + hall + datetime)
        const exists = await Show.exists({
          movie: movie._id.toString(),
          hall,
          showDateTime,
        });

        if (!exists) {
          showsToCreate.push({
            movie: movie._id.toString(),
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

    // 💾 Save to Show collection
    await Show.insertMany(showsToCreate);

    res.status(201).json({
      success: true,
      message: "Shows added successfully.",
      totalShowsAdded: showsToCreate.length,
      movieTitle: movie.title,
      source: movie.__t === "ManualMovie" ? "manual" : "tmdb",
    });
  } catch (error) {
    console.error("Add Show Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while adding shows.",
    });
  }
};
