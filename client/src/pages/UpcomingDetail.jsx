import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bell } from "lucide-react";
import TimeFormat from "../lib/TimeForamt";
import Loading from "../components/Loading";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

import { dFormat } from "../lib/dFormat";

const UpcomingDetail = () => {
  const { id } = useParams();
  const { axios } = useAppContext();

  const [upcoming, setUpcoming] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reminded, setReminded] = useState(false);

  const resolveUrl = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value.startsWith("//") ? `https:${value}` : value;
    if (typeof value === "object") return value.secure_url || value.url || null;
    return null;
  };

  const getYouTubeEmbedUrl = (link) => {
    if (!link) return null;
    try {
      const url = new URL(link);
      if (url.hostname.includes("youtube.com") && url.searchParams.get("v")) {
        return `https://www.youtube.com/embed/${url.searchParams.get("v")}`;
      } else if (url.hostname.includes("youtu.be")) {
        return `https://www.youtube.com/embed${url.pathname}`;
      }
    } catch {
      return null;
    }
    return null;
  };

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

  useEffect(() => {
    getUpcoming();
  }, [id]);

  useEffect(() => {
    const saved = localStorage.getItem(`reminder_${id}`);
    if (saved === "true") setReminded(true);
  }, [id]);



  if (loading)
    return (
      <div className="text-center text-gray-300 mt-20 text-lg">
        <Loading />
      </div>
    );

  if (notFound || !upcoming)
    return (
      <div className="flex flex-col items-center justify-center mt-40 mb-40 text-center px-10 py-12 bg-transparent rounded-2xl shadow-lg max-w-md mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-amber-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
        </svg>
        <h2 className="text-2xl font-bold text-white mb-2">Sorry!</h2>
        <p className="text-gray-300 text-lg">Movie not found. Please check the link or try again later.</p>
      </div>
    );

  const {
    title,
    description,
    release_date,
    language,
    runtime,
    come_date,
    genres,
    backdrop_path,
    casts,
    trailer,
  } = upcoming;

  const posterSrc = resolveUrl(backdrop_path) || "/images/default-poster.jpg";
  const trailerEmbedUrl = getYouTubeEmbedUrl(trailer);

  return (
    <div className="relative w-full bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white">
      {/* --- Hero Section --- */}
      <div className="relative flex flex-col lg:flex-row gap-10 max-w-6xl mx-auto w-full px-6 pt-32 pb-16">
        {/* Poster */}
        <div className="relative flex justify-center lg:justify-start">
          <img
            src={posterSrc}
            alt={title}
            className="rounded-2xl shadow-2xl max-w-[340px] w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/default-poster.jpg"; }}
          />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center space-y-4">
          <div className="flex justify-between items-center">
            <p className="uppercase underline text-primary-dull/80 tracking-widest">{(language || "").toUpperCase()}</p>
          <span className="uppercase bg-amber-500 text-black font-bold py-1 px-4 rounded-lg shadow">
  {come_date ? dFormat(come_date) : "Coming Soon"}
</span>
          </div>

          <h1 className="text-5xl font-bold leading-tight drop-shadow-lg">{title}</h1>

          <p className="text-gray-300 text-sm mt-2">
            {TimeFormat(runtime)} · {Array.isArray(genres) ? genres.map((g) => g.name || g).join(", ") : "No genres"} · {release_date?.split("-")[0]}
          </p>

          <p className="text-gray-400 text-base leading-relaxed mt-3 max-w-3xl italic">{description}</p>


        </div>
      </div>

      {/* --- Cast Members --- */}
      {Array.isArray(casts) && casts.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 mt-10">
          <h2 className="text-2xl font-semibold mb-5 border-l-4 border-amber-500 pl-3">Cast Members</h2>
          <div className="flex gap-8 overflow-x-auto no-scrollbar py-4">
            {casts.map((cast, i) => {
              const imgSrc = cast.profile_path || cast.castsImage?.url || "/images/default-cast.jpg";
              return (
                <div key={i} className="flex flex-col items-center text-center flex-shrink-0 group">
                  <div className="relative">
                    <img
                      src={imgSrc}
                      alt={cast.name}
                      className="rounded-full h-28 w-28 object-cover border-2 border-amber-500/70 shadow-md group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  </div>
                  <p className="font-medium text-sm mt-3 text-gray-200">{cast.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- Trailer --- */}
      {trailerEmbedUrl && (
        <div className="mt-20 flex justify-center  border-gray-800 shadow-inner">
          <div className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
            <iframe
              src={trailerEmbedUrl}
              title={`${title} Trailer`}
              className="w-full aspect-video rounded-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      <div className="py-10"></div>
    </div>
  );
};

export default UpcomingDetail;
