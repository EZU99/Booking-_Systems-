import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bell, Star } from "lucide-react";
import TimeFormat from "../lib/TimeForamt";
import Loading from "../components/Loading";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";


const UpcomingDetail = () => {
  const { id } = useParams();
  const { axios } = useAppContext();

  const [upcoming, setUpcoming] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reminded, setReminded] = useState(false);

  // Helper: normalize Cloudinary URLs
  const resolveUrl = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value.startsWith("//") ? `https:${value}` : value;
    if (typeof value === "object") return value.secure_url || value.url || null;
    return null;
  };

  // Ensure Cloudinary video has mp4 format if no extension
  const cloudinaryEnsureMp4 = (url) => {
    if (!url) return url;
    if (/\.\w{2,5}($|\?)/.test(url)) return url; // already has extension
    if (url.includes("/upload/")) return url.replace("/upload/", "/upload/f_mp4/");
    return url;
  };

  // Fetch upcoming data
  const getUpcoming = async () => {
    try {
      setLoading(true);
      setNotFound(false);
      const { data } = await axios.get(`/api/upcoming/get-upcoming/${id}`);
      if (data?.success && data?.upcoming) setUpcoming(data.upcoming);
      else setNotFound(true);
    } catch (err) {
      console.error("Error fetching upcoming:", err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  // Check localStorage for reminder
  useEffect(() => {
    const saved = localStorage.getItem(`reminder_${id}`);
    if (saved === "true") setReminded(true);
  }, [id]);

  const handleReminder = () => {
    setReminded(true);
    localStorage.setItem(`reminder_${id}`, "true");
    toast.success("Reminder set — we'll remind you when the movie   Shows 🎬");
  };

  useEffect(() => {
    getUpcoming();
  }, [id]);

  if (loading) return <div className="text-center text-gray-300 mt-20 text-lg"><Loading /></div>;

  if (notFound || !upcoming)
    return (
      <div className="flex flex-col items-center justify-center mt-40 mb-40 text-center px-10 py-12 bg-transparent rounded-2xl shadow-lg max-w-md mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-amber-800/90 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
        </svg>
        <h2 className="text-2xl font-bold text-white mb-2">Sorry!</h2>
        <p className="text-gray-300 text-lg">Movie not found. Please check the link or try again later.</p>
      </div>
    );

  const { title, description, release_date, language, runtime, genres, backdrop_path, casts, trailer } = upcoming;

  const posterSrc = resolveUrl(backdrop_path) || "/images/default-poster.jpg";
  const trailerSrc = trailer ? cloudinaryEnsureMp4(resolveUrl(trailer)) : null;

  return (
    <div className="relative w-full px-5 pt-20 max-lg:px-6 max-lg:pt-20 h-380 min:h-350 bg-gradient-to-b  from-gray-900 to-gray-950">
      {/* Header: poster + details */}
      <div className="flex flex-col lg:flex-row gap-6  max-w-6xl mx-auto w-full mt-40">
        {/* Poster */}
        <img
          src={posterSrc}
          alt={title || "Poster"}
          className="mx-auto max-w-[320px] w-full rounded-xl h-auto object-cover"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/default-poster.jpg"; }}
        />

        {/* Details */}
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <div className="flex justify-between items-center mt-4">
            <p className="uppercase underline text-primary-dull/78">{(language || "").toUpperCase()}</p>
            <p className="uppercase bg-primary border py-1 px-5 border-amber-50/50 rounded text-primary-dull">UPCOMING</p>
          </div>

          <h1 className="text-4xl font-semibold mt-2">{title}</h1>
          <p className="text-gray-300 text-sm mt-2">
            {TimeFormat(runtime)} · {Array.isArray(genres) ? genres.map((g) => g.name || g).join(", ") : "No genres"} · {release_date?.split("-")[0]}
          </p>
          <p className="text-gray-400 text-sm mt-4 italic">{description || "No description available."}</p>

          {/* Reminder */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <button
              onClick={handleReminder}
              disabled={reminded}
              className={`flex items-center justify-center gap-2 px-7 py-3 text-sm rounded-md font-medium active:scale-95 ${
                reminded ? "bg-gray-600 text-gray-300 cursor-not-allowed" : "bg-amber-500 text-black hover:bg-amber-600"
              }`}
            >
              <Bell className="w-5 h-5" />
              {reminded ? "Reminder Set" : "Set Reminder"}
            </button>
          </div>
        </div>
      </div>

        {/* Cast list */}
     {/* --- Cast Members --- */}
{Array.isArray(casts) && casts.length > 0 && (
  <div className="relative  mt-30 w-full overflow-x-auto no-scrollbar">
    <div className="flex gap-10 px-6 justify-start items-center xl:flex-wrap xl:justify-center">
        
      {casts.map((cast, index) => {
        const imgSrc = cast.profile_path
          ? (image_base_url ? `${image_base_url}${cast.profile_path}` : cast.profile_path)
          : cast.castsImage?.url || "/images/default-cast.jpg";

        return (
          <div
            key={index}
            className="flex flex-col items-center text-center flex-shrink-0"
          >
            <img
              src={imgSrc}
              alt={cast.name}
              className="rounded-full h-28 w-28 object-cover border-primary-dull border-2"
              loading="lazy"
            />
            <p className="font-medium text-xs mt-3">{cast.name}</p>
          </div>
        );
      })}
    </div>
  </div>
)}

      {/* Trailer */}
      {trailerSrc && (
        <div className="mt-20 flex justify-center">
          <video
            src={trailerSrc}
            controls
            playsInline
            preload="metadata"
            poster={posterSrc}
            className="w-full max-w-4xl rounded-xl border border-gray-800 object-cover aspect-video"
            onError={(e) => { e.currentTarget.onerror = null; toast.error("Failed to load trailer."); }}
          />
        </div>
      )}

    

    </div>
  );
};

export default UpcomingDetail;
