import React, { useState } from "react";
import Share from "../global/share";

const JWTTop = ({ main }) => {
  const [isShareOpen, setIsShareOpen] = useState(false);

  const handleShareClick = () => {
    setIsShareOpen(true);
  };

  const handleShareClose = () => {
    setIsShareOpen(false);
    document.body.classList.remove("overflow-hidden")
  };

  return (
    <div className="text-white pt-14  bg-[#0C4B33] w-full h-[414px] flex flex-col items-center justify-center transition-all duration-300">
      <div className="lg:container  w-[95%] md:w-[80%] mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">{main}</h1>
        <p className="select-auto text-lg mb-4">
          Easily encode, decode, and verify JSON Web Tokens.
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={handleShareClick}
            className="shadow-md shadow-black flex items-center gap-2 text-md bg-white text-[#0C4B33] py-2 px-4 rounded-full font-semibold hover:bg-gray-200 transition duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              className="bi bi-share w-[18px] h-[18px]"
              viewBox="0 0 16 16"
            >
              <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5m-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3" />
            </svg>
            <span className="mt-[1px]">Share</span>
          </button>
        </div>
      </div>
      {isShareOpen && (
        <Share
          isOpen={isShareOpen}
          url={window.location.href}
          onClose={handleShareClose}
        />
      )}
    </div>
  );
};

export default JWTTop;
