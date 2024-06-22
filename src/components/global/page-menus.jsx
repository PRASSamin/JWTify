import React, { useState, useEffect } from "react";

const PageMenus = ({ pageMenus }) => {
  const [isPageMenuOpen, setIsPageMenuOpen] = useState(false);
  const [isSvgRotated, setIsSvgRotated] = useState(false);

  // Function to handle scroll events
  const handleScroll = () => {
    const scrollY = window.scrollY;

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollPercentage = (scrollY / (documentHeight - windowHeight)) * 100;

    if (scrollPercentage > 30) {
      setIsSvgRotated(true);
    } else {
      setIsSvgRotated(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", () => {
      setIsPageMenuOpen(false);
    });
    return () => {
      window.removeEventListener("scroll", () => {
        setIsPageMenuOpen(false);
      });
    };
  }, []);

  useEffect(() => {
    window.addEventListener("click", handleClickOutsideMenu);
    return () => {
      window.removeEventListener("click", handleClickOutsideMenu);
    };
  }, []);

  const handleClickOutsideMenu = (event) => {
    const menu = document.querySelector(".menu");
    if (menu && !menu.contains(event.target)) {
      setIsPageMenuOpen(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsPageMenuOpen(!isPageMenuOpen)}
        className="menu shadow-md shadow-black/50 bg-gray-700 p-3 fixed bottom-5 rounded-full right-5 hover:bg-gray-600 transition-all duration-300"
      >
        <svg
          fill="currentColor"
          version="1.1"
          className={`fill-current text-gray-200 w-[30px] h-[30px] md:w-[25px] md:h-[25px] ${
            isSvgRotated ? "-rotate-90" : "rotate-90"
          } transition-transform duration-300`}
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 330 330"
          xmlSpace="preserve"
        >
          <path
            d="M250.606,154.389l-150-149.996c-5.857-5.858-15.355-5.858-21.213,0.001
        c-5.857,5.858-5.857,15.355,0.001,21.213l139.393,139.39L79.393,304.394c-5.857,5.858-5.857,15.355,0.001,21.213
        C82.322,328.536,86.161,330,90,330s7.678-1.464,10.607-4.394l149.999-150.004c2.814-2.813,4.394-6.628,4.394-10.606
        C255,161.018,253.42,157.202,250.606,154.389z"
          />
        </svg>{" "}
      </button>
      <div
        className={`${
          isPageMenuOpen ? "max-h-80" : "max-h-0"
        } menu rounded-lg shadow-md shadow-black/50 transition-all duration-300 overflow-y-auto fixed bottom-[91px] right-5 z-20`}
      >
        {pageMenus.map((pageMenu, index) => {
          const { id, name } = pageMenu;
          return (
            <a key={index} href={`#${id}`}>
              <div
                className={`font-bold text-white px-5 py-4 bg-gray-700 transition-all duration-300`}
              >
                {name}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default PageMenus;
