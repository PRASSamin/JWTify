import React, { useState, useEffect } from "react";
import LogoWithText from "../../assets/logo/jwtc-logo-w-text.svg";
import LogoWithOutText from "../../assets/logo/jwtc-logo-wout-text.svg";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const tab = [
    { tab: "Encode JWT", url: "/#/jwt-encoder" },
    { tab: "Decode JWT", url: "/#/jwt-decoder" },
  ];

  useEffect(() => {
    setTimeout(() => {
      document.querySelector(".page-header").classList.remove("-top-40");
      document.querySelector(".page-header").classList.add("top-0");
    }, 1);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="page-header border-b-[1px] border-white/20 shadow-lg bg-[#0C4B33] transition-all duration-300 fixed -top-40 left-0 right-0 z-[1000]">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-1 md:flex md:items-center md:gap-12">
            <a className="block h-full text-teal-600" href="/">
              <span className="sr-only">Home</span>
              <img
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(100%) sepia(100%) saturate(0%) hue-rotate(129deg) brightness(101%) contrast(103%)",
                }}
                className="h-12"
                src={LogoWithOutText}
                alt="logo"
              />
            </a>
          </div>

          <div className="md:flex md:items-center md:gap-12">
            <nav aria-label="Global" className="hidden md:block">
              <ul className="flex items-center gap-6 text-sm font-bold">
                {tab.map(({ tab, url }, index) => (
                  <li key={index}>
                    <a
                      className="text-white transition hover:text-[#44B78B]"
                      href={url}
                    >
                      {tab}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center">
              <div className="block md:hidden">
                {/* Menu Button for Mobile */}
                <button
                  onClick={toggleMenu}
                  className="rounded p-2 text-gray-600 transition hover:text-gray-600/75"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>

              {/* Mobile Menu */}
              <div className="md:hidden block">
                <div
                  onClick={toggleMenu}
                  className={`${
                    isMenuOpen ? "block" : "hidden"
                  } backdrop-blur-sm bg-[#000000]/50 w-full h-screen absolute top-0 left-0`}
                />

                <nav
                  className={`transform transition-all duration-300 absolute bg-[#0C4B33] z-20 right-0 top-0 h-screen w-1/2 ${
                    isMenuOpen ? "translate-x-0" : "translate-x-full"
                  }`}
                >
                  <ul className="flex flex-col items-center text-[13.5px] font-bold">
                    {tab.map(({ tab, url }, index) => {
                      return (
                        <div key={index} className="w-full px-[10px]">
                          <li className="w-full flex justify-center py-[18px] border-b border-[#106142]">
                            <a
                              className="text-white transition hover:text-[#44B78B]"
                              href={url}
                            >
                              {tab}
                            </a>
                          </li>
                        </div>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
