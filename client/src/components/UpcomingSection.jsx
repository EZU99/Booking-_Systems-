import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import UpcomingMovieCard from "./UpcomingMovieCard";
import BlurCircle from "./BlurCircle";
import { useAppContext } from "../context/AppContext";

const UpcomingSection = () => {
  const { axios } = useAppContext();

  const [upcomings, setUpcomings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [isDesktop, setIsDesktop] = useState(true);

  // ✅ Fetch upcoming movies from backend
  useEffect(() => {
    const fetchUpcomings = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/upcoming/get-upcomings");
        if (data?.success && Array.isArray(data.upcoming)) {
          setUpcomings(data.upcoming);
        } else {
          setUpcomings([]);
        }
      } catch (error) {
        console.error("Error fetching upcoming movies:", error);
        setUpcomings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomings();
  }, [axios]);

  // ✅ Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 1280) {
        setItemsPerPage(upcomings.length);
        setIsDesktop(false);
      } else {
        setItemsPerPage(3);
        setIsDesktop(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [upcomings.length]);

  // ✅ Prevent overflow
  useEffect(() => {
    if (startIndex >= upcomings.length) {
      setStartIndex(0);
    }
  }, [upcomings.length, startIndex]);

  const totalUpcomings = upcomings.length;
  const nextSlide = () => {
    if (startIndex + itemsPerPage < totalUpcomings) {
      setStartIndex(startIndex + itemsPerPage);
    }
  };
  const prevSlide = () => {
    if (startIndex - itemsPerPage >= 0) {
      setStartIndex(startIndex - itemsPerPage);
    }
  };

  const visibleUpcomings = upcomings.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 sm:mb-0 overflow-hidden relative bg-gradient-to-b min-h-[70vh] from-gray-900 via-black to-gray-900">
      <BlurCircle top="-100px" left="-100px" />

      {/* Title */}
      <div className="flex items-center justify-between pt-20 pb-10">
        <p className="text-gray-300 font-medium text-lg">
          <span className="inline-block text-3xl animate-bounce">⏳</span>
          <span className="text-gray-200 ml-2">COOMING SOON</span>
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <div className="relative">
            <span className="text-6xl animate-spin">🎞️</span>
            <div className="absolute inset-0 blur-2xl bg-amber-400/20 rounded-full"></div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-300">Loading upcoming movies...</h1>
        </div>
      ) : totalUpcomings === 0 ? (
        // No movies fallback
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <div className="relative">
            <span className="text-6xl animate-bounce">🎬</span>
            <div className="absolute inset-0 blur-2xl bg-amber-400/20 rounded-full"></div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-center text-amber-300/90 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]">
            Upcoming Movies Not Available
          </h1>
          <p className="text-gray-400 text-center max-w-md">
            Check back later for the latest shows — new movies are coming soon!
          </p>
        </div>
      ) : (
        // ✅ Movie Cards
        <div className="flex items-center gap-4 flex-wrap justify-center">
          {/* Left Arrow (desktop only) */}
          {isDesktop && totalUpcomings > itemsPerPage && (
            <button
              onClick={prevSlide}
              disabled={startIndex === 0}
              className="p-2 bg-gray-700 rounded-full disabled:opacity-30"
            >
              <ArrowLeft className="text-white" />
            </button>
          )}

          {/* ✅ Updated prop name here */}
          <div
            className={`flex gap-6 ${
              isDesktop ? "flex-1 justify-center" : "flex-wrap justify-center w-full"
            }`}
          >
            {visibleUpcomings.map((upcoming) => (
              <UpcomingMovieCard key={upcoming._id} upcoming={upcoming} />
            ))}
          </div>

          {/* Right Arrow (desktop only) */}
          {isDesktop && totalUpcomings > itemsPerPage && (
            <button
              onClick={nextSlide}
              disabled={startIndex + itemsPerPage >= totalUpcomings}
              className="p-2 bg-gray-700 rounded-full disabled:opacity-30"
            >
              <ArrowRight className="text-white" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UpcomingSection;
