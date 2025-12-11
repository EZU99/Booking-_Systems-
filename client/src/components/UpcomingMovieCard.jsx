import { useNavigate } from "react-router-dom";
import TimeForamt from "../lib/TimeForamt";
import {  Clock } from "lucide-react";

const UpcomingMovieCard = ({ upcoming }) => {
  const navigate = useNavigate();

  if (!upcoming) return null;

  // ✅ Safe image handling
  const posterSrc =
    (typeof upcoming.backdrop_path === "string" && upcoming.backdrop_path) ||
    (upcoming.backdrop_path && upcoming.backdrop_path.url) ||
    (upcoming.backdrop_path && upcoming.backdrop_path.secure_url) ||
    "/images/default-poster.jpg";

  // ✅ Genre formatting
  const genresList = Array.isArray(upcoming.genres)
    ? upcoming.genres.map((g) => (typeof g === "string" ? g : g?.name || "")).filter(Boolean)
    : [];
  const genresDisplay = genresList.length ? genresList.join(" | ") : "N/A";

  return (
    <div className="group flex flex-col justify-between bg-gray-900 rounded-2xl overflow-hidden shadow-md hover:shadow-yellow-500/20 hover:-translate-y-1 transition-transform duration-300 w-84 border-2 border-amber-500/15">
      
      {/* Poster Section */}
      <div className="relative w-full h-100 overflow-hidden cursor-pointer">
        <img
          onClick={() => {
            navigate(`/upcoming/${upcoming._id}`); // ✅ correct route
            window.scrollTo(0, 0);
          }}
          src={posterSrc}
          alt={upcoming.title || "Movie Poster"}
          className="w-full h-full object-cover object-center rounded-t-3xl transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
  
          loading="lazy"
          onError={(e) => (e.currentTarget.src = "/images/default-poster.jpg")}
        />



        {/* Yellow border hover glow */}
        <div className="absolute inset-0 ring-1 ring-yellow-500/30 group-hover:ring-yellow-400/60 rounded-t-2xl transition duration-300"></div>
      </div>

      {/* Movie Info */}
      <div className="p-4 flex flex-col flex-grow space-y-2">
        {/* Title + Year */}
        <div className="flex justify-between items-center">
          <p className="font-semibold text-lg text-white truncate">{upcoming.title}</p>
          <span className="text-sm text-gray-400">
            {upcoming.release_date ? new Date(upcoming.release_date).getFullYear() : "TBA"}
          </span>
        </div>

        {/* Genres, Language, Runtime */}
        <div className="flex justify-between items-center text-sm text-gray-400">
          <span className="truncate">{genresDisplay}</span>
          <span>{upcoming.language || "N/A"}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{TimeForamt(upcoming.runtime)}</span>
          </span>
        </div>

        {/* View More */}
        <button
          onClick={() => {
            navigate(`/upcoming/${upcoming._id}`);
            window.scrollTo(0, 0);
          }}
          className="mt-3 py-2 px-4 bg-amber-500/90 hover:bg-amber-400 text-black font-medium rounded-lg transition-all duration-200"
        >
          View More Details
        </button>
      </div>
    </div>
  );
};

export default UpcomingMovieCard;
