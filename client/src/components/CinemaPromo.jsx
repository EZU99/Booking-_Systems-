import React, { useState, useEffect } from "react";
import cinemaImage from "../assets/cinema.png";
import lcinemaImage from "../assets/lcinema.png";

const textLines = [
  "💺 Book seats online easily",
  "💰 Best prices guaranteed",
  "🏛️ Rent halls for private events",
  "🎉 Enjoy the cinematic moment",
  "🙏 Thank you!", // final message
];

const CinemaPromo = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % (textLines.length + 1));
    }, 2500); // 2.5 seconds per step

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[600px] md:h-[750px] lg:h-[900px] overflow-hidden rounded-xl shadow-xl mt-20">
      {/* Background Image */}
      <img
        src={cinemaImage}
        alt="Cinema"
        className="absolute inset-0 w-full h-full object-cover md:hidden"
      />
      <img
        src={lcinemaImage}
        alt="Cinema Large"
        className="absolute inset-0 w-full h-full object-cover hidden md:block"
      />

      {/* Text Box */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-sm px-8 py-6 rounded-xl flex flex-col items-center space-y-4">
          {textLines.map((line, index) => (
            <p
              key={index}
              className={`text-white text-center text-2xl md:text-3xl font-semibold italic transition-transform duration-1000 ${
                index < currentStep
                  ? "translate-x-0 opacity-100"
                  : "translate-x-full opacity-0"
              }`}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CinemaPromo;
