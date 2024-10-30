import React, { useEffect, useState } from "react";
import Alert from "../global/alert";
import WhatsappIcon from "../../assets/icons/whatsapp.svg";
import FacebookIcon from "../../assets/icons/facebook.svg";
import TwitterIcon from "../../assets/icons/twitter-x.svg";
import LinkedinIcon from "../../assets/icons/linkedin.svg";
import TelegramIcon from "../../assets/icons/telegram.svg";
import TumblrIcon from "../../assets/icons/tumblr.svg";

const Share = ({ isOpen, url, onClose }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [alertInfo, setAlertInfo] = useState({});

  const text = encodeURIComponent(
    "Check out this awesome tool for encoding, decoding, and verifying JSON Web Tokens!"
  );
  const tags = "JWTify,jwt,pras,prassamin";

  const Icons = [
    { platform: "facebook", icon: FacebookIcon, filter: "invert(30%) sepia(50%) saturate(1943%) hue-rotate(171deg) brightness(90%) contrast(88%)" },
    { platform: "twitter", icon: TwitterIcon, filter: "brightness(0) saturate(100%) invert(30%) sepia(19%) saturate(495%) hue-rotate(154deg) brightness(102%) contrast(85%)" },
    { platform: "telegram", icon: TelegramIcon, filter: "invert(14%) sepia(26%) saturate(4265%) hue-rotate(192deg) brightness(89%) contrast(85%)" },
    { platform: "linkedin", icon: LinkedinIcon, filter: "invert(41%) sepia(3%) saturate(3321%) hue-rotate(201deg) brightness(92%) contrast(95%)" },
    { platform: "whatsapp", icon: WhatsappIcon, filter: "invert(67%) sepia(7%) saturate(3288%) hue-rotate(122deg) brightness(88%) contrast(83%)" },
    { platform: "tumblr", icon: TumblrIcon, filter: "invert(40%) sepia(61%) saturate(347%) hue-rotate(225deg) brightness(92%) contrast(90%)" },
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isOpen]);

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(url);
      setIsCopied(true);
      setAlertInfo({ type: "info", message: "Copied to clipboard", isShow: true });
      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    } catch (e) {
      setIsCopied(false);
      setAlertInfo({ type: "error", message: "Copy failed: " + e.message, isShow: true });
    }
  };

  const shareOnSocialMedia = (platform) => {
    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer.php?u=${encodeURI(url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURI(url)}&text=${text}&hashtags=${tags}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${encodeURI(url)}&text=${text}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURI(url)}`;
        break;
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${text + " " + encodeURI(url)}`;
        break;
      case "tumblr":
        const baseUrl = "http://www.tumblr.com/share/link";
        shareUrl = `${baseUrl}?url=${encodeURIComponent(url)}&tags=${tags}&description=${encodeURIComponent(text)}`;
        break;
      default:
        break;
    }
    window.open(shareUrl);
  };

  return (
    <div className={`fixed z-[999] top-0 left-0 w-full h-full flex items-center justify-center transition-all duration-300 ${isOpen ? "" : "opacity-0 invisible"}`}>
      <div className="absolute top-0 left-0 w-full h-full bg-black/30" onClick={() => onClose()} />
      <div className="relative h-[300px] sm:h-[300px] aspect-[4/3] text-black rounded-lg p-6 shadow-lg bg-white aspect-w-4 aspect-h-3 flex flex-col justify-between">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" onClick={() => onClose()} className="w-8 h-8 p-[3px] bg-gray-400 rounded-full absolute -top-2.5 -right-2.5 cursor-pointer hover:bg-gray-500 hover:text-gray-100 transition-all duration-300" viewBox="0 0 16 16">
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
        </svg>
        <h2 className="text-center text-lg font-medium mb-4 font-shoika">Share</h2>
        <div className="w-full flex flex-wrap justify-around">
          {Icons.map(({ platform, icon, filter }, index) => (
            <button key={index} type="button" onClick={() => shareOnSocialMedia(platform)} className="relative p-3 bg-black rounded-full hover:scale-150 transition-all duration-300">
              <img className="w-5" src={icon} alt="" style={{ filter: filter }} />
            </button>
          ))}
        </div>
        <div className="w-full flex flex-col gap-3">
          <p className="text-center uppercase text-[10px] sm:text-[12px]">or copy link</p>
          <div className="flex gap-1 relative">
            <div className="flex items-center justify-center bg-gray-300 px-2 py-2 rounded-l-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z" />
                <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z" />
              </svg>
            </div>
            <input className="w-full bg-gray-300 px-3 py-2 text-[14px] rounded-r-md focus:outline-none" type="text" value={url} readOnly />
            <button className="text-[#008854] hover:text-[#0C4B33] transition-all duration-300 text-[12px] font-shoika absolute right-2 top-1/2 -translate-y-[40%] font-medium uppercase cursor-pointer" onClick={handleCopy}>
              {isCopied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
      {alertInfo.isShow && <Alert alertInfo={alertInfo} />}
    </div>
  );
};

export default Share;
