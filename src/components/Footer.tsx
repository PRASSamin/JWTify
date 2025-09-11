import React from "react";

const Footer = () => {
  return (
    <footer className="w-full py-5 border-t font-edu z-10 relative">
      <div className="container mx-auto text-center text-lg">
        <p className="mt-2">
          Built with ❤️ by{" "}
          <a
            href="https://pras.me"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline font-bold"
          >
            PRAS Samin
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
