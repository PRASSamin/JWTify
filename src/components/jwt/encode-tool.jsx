import React, { useState, useEffect, useRef } from "react";
import "../jwt/Converter.css";
import Alert from "../global/alert";
import axios from "axios";
import { PasteIcon, PastedIcon } from "./decode-tool";
import RippleButton from "../global/ripple-button";

const DecoderTool = () => {
  // Constants
  const LoadEnv = import.meta.env.VITE_SECRET_AND_PRIVATE_KEY;
  const PlainText = JSON.parse(LoadEnv);
  const { keys } = PlainText;

  const defaultSecretKeys = {
    HS256: { key: keys.HS256 }, HS384: { key: keys.HS384 }, HS512: { key: keys.HS512 },
    RS256: { key: keys.RS256 }, RS384: { key: keys.RS384 }, RS512: { key: keys.RS512 },
    ES256: { key: keys.ES256 }, ES384: { key: keys.ES384 }, ES512: { key: keys.ES512 },
    PS256: { key: keys.PS256 }, PS384: { key: keys.PS384 }, PS512: { key: keys.PS512 },
  };

  const algorithmOptions = [
    "HS256", "HS384", "HS512", "RS256", "RS384", "RS512",
    "ES256", "ES384", "ES512", "PS256", "PS384", "PS512"
  ].map((alg) => ({ label: alg, value: alg }));

  // State
  const [userJWTData, setUserJWTData] = useState({ token: null });
  const [TokenInputFocused, setTokenInputFocused] = useState(false);
  const [alertInfo, setAlertInfo] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [isTokenPasted, setIsTokenPasted] = useState(false);
  const [isSecretKeyPasted, setIsSecretKeyPasted] = useState(false);
  const [UserPayLoad, setUserPayLoad] = useState("");
  const [SecretKey, setSecretKey] = useState("");
  const [PrivateKey, setPrivateKey] = useState("");
  const [UserAlgorithm, setUserAlgorithm] = useState("HS256");
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const dropdownRef = useRef(null);
  const jwtTokenRef = useRef(null);

  // Effects
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (userJWTData.token && window.innerWidth < 768) {
      setTimeout(() => {
        const headerOffset = 140;
        const elementPosition = jwtTokenRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }, 100);
    }
  }, [userJWTData.token]);

  // Handlers
  const handlePaste = async (setFunction, setStateFunction) => {
    try {
      const text = await navigator.clipboard.readText();
      setFunction(text);
      setStateFunction(true);
      setAlertInfo({ type: "info", message: "Paste success", isShow: true });
      setTimeout(() => setStateFunction(false), 2500);
    } catch (e) {
      setAlertInfo({
        type: "error",
        message: `Paste failed: ${e.message}`,
        isShow: true,
      });
    }
  };

  const handleOptionSelect = (selectedValue) => {
    setUserAlgorithm(selectedValue);
    setPrivateKey("");
    setSecretKey("");
    setIsOpen(false);
  };

  const EncodeJWT = async () => {
    try {
      if (
        ["HS256", "HS384", "HS512"].includes(UserAlgorithm) &&
        SecretKey.includes("BEGIN PRIVATE KEY")
      ) {
        setAlertInfo({
          type: "error",
          isShow: true,
          message: "Secret key must be a symmetric key",
        });
        return;
      }

      let jsonPayload;
      try {
        jsonPayload = JSON.stringify(JSON.parse(UserPayLoad));
      } catch (error) {
        setAlertInfo({
          type: "error",
          isShow: true,
          message: "Invalid JSON payload",
        });
        return;
      }
      setIsLoading(true);

      const keyParam = PrivateKey
        ? `pk=${encodeURIComponent(PrivateKey)}`
        : SecretKey
        ? `sk=${encodeURIComponent(SecretKey)}`
        : "";

      const url = `https://jwt-backend-eta.vercel.app/api/generate-jwt/${UserAlgorithm}/${encodeURIComponent(
        jsonPayload
      )}?${keyParam}`;
      const res = await axios.get(url);

      setAlertInfo({
        message: "Successfully generated the token",
        type: "success",
        isShow: true,
      });
      setUserJWTData({ token: res.data.token });
      setIsLoading(false);

      if (window.innerWidth < 768) {
        setTimeout(() => {
          const headerOffset = 140;
          const elementPosition = jwtTokenRef.current.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }, 100);
      }
    } catch {
      setIsLoading(false);
      setAlertInfo({
        message: "Something went wrong, please try again!",
        type: "error",
        isShow: true,
      });
    }
  };

  // Render
  return (
    <div id="encoder" data-name="Encoder" className="mt-24">
    <div className="lg:container w-[95%] md:w-[80%] mx-auto flex flex-col gap-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col gap-7 justify-start md:w-[25%]">
          <div className="flex flex-col w-full relative">
            <p className="py-[6px] px-[8px] uppercase text-[12px] md:text-[13px] font-thin w-full border-t border-r border-l border-gray-400">
              Algorithm
            </p>
            <div ref={dropdownRef} className="z-20 relative">
              <div className="select-component">
                <div className="custom-select">
                  <div
                    className="selected-option rounded-b-lg outline-none w-full border border-gray-400 bg-white p-2"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    {UserAlgorithm}
                    <svg
                      className={`w-4 h-4 ml-2 inline-block transform ${
                        isOpen ? "rotate-180" : "rotate-0"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  {isOpen && (
                    <div className="select-none options-container absolute mt-1 bg-white border border-gray-400 w-full rounded-b-lg shadow-lg">
                      {algorithmOptions.map((option) => (
                        <div
                          key={option.value}
                          className={`option hover:bg-gray-200 relative py-[6px] px-[8px] text-[13px] font-medium cursor-pointer ${
                            UserAlgorithm === option.value
                              ? "bg-gray-200"
                              : ""
                          }`}
                          onClick={() => handleOptionSelect(option.value)}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <RippleButton
            onClick={EncodeJWT}
            rippleClass="bg-[#51be95]"
            className="h-full hidden md:block font-bold text-sm md:text-[15px] rounded-full bg-[#44B78B] py-2.5 md:p-0"
          >
            <div className="flex relative space-x-2 justify-center items-center ">
              <span
                className={`${
                  !isLoading ? "block" : "hidden"
                } transition-all duration-300 absolute`}
              >
                Encode
              </span>
              <div className={`${!isLoading ? "hidden" : ""} flex space-x-2`}>
                <div class="h-2 w-2 bg-white rounded-full animate-bounce2 [animation-delay:-0.3s]"></div>
                <div class="h-2 w-2 bg-white rounded-full animate-bounce2 [animation-delay:-0.15s]"></div>
                <div class="h-2 w-2 bg-white rounded-full animate-bounce2"></div>
              </div>{" "}
            </div>
          </RippleButton>
        </div>
        <div className="flex flex-col justify-start md:w-[75%] relative">
          <p className="py-[6px] px-[8px] uppercase w-full text-[12px] md:text-[13px] font-thin w-full border-t border-r border-l border-gray-400">
            {["HS256", "HS384", "HS512"].includes(UserAlgorithm)
              ? "Secret Key"
              : "Private Key"}
          </p>
          <textarea
            spellCheck="false"
            value={
              ["HS256", "HS384", "HS512"].includes(UserAlgorithm)
                ? SecretKey
                : PrivateKey
            }
            onChange={(e) =>
              ["HS256", "HS384", "HS512"].includes(UserAlgorithm)
                ? setSecretKey(e.target.value)
                : setPrivateKey(e.target.value)
            }
            className="outline-none rounded-b-lg border border-gray-400 p-2 min-h-[120px]"
            style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}
            type="text"
          />
          <button
            onClick={() =>
              handlePaste(
                ["HS256", "HS384", "HS512"].includes(UserAlgorithm)
                  ? setSecretKey
                  : setPrivateKey,
                setIsSecretKeyPasted
              )
            }
            className="absolute bottom-1 right-1 bg-white rounded-lg p-2"
          >
            {!isSecretKeyPasted ? <PasteIcon /> : <PastedIcon />}
          </button>
          <button
            onClick={() =>
              ["HS256", "HS384", "HS512"].includes(UserAlgorithm)
                ? setSecretKey(defaultSecretKeys[UserAlgorithm].key)
                : setPrivateKey(defaultSecretKeys[UserAlgorithm].key)
            }
            className={`bg-purple-300 text-purple-900 border-purple-900 hover:bg-purple-400 transition-all duration-300 font-bold rounded-full text-center border-[1.5px] text-[13px] py-[1.5px] px-[8px] absolute top-1 right-1`}
          >
            Import Basic Key
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col">
          <div className="flex flex-col relative">
            <p
              className={`${
                TokenInputFocused ? "border-blue-600" : "border-gray-400"
              } py-[6px] px-[8px] uppercase text-[12px] md:text-[13px] font-thin w-full border-t border-r border-l`}
            >
              PayLoad
            </p>
            <textarea
              onChange={(e) => setUserPayLoad(e.target.value)}
              onFocus={() => setTokenInputFocused(true)}
              onBlur={() => setTokenInputFocused(false)}
              value={UserPayLoad}
              spellCheck="false"
              className="focus:border-blue-600 text-[16px] md:text-[20px] outline-none font-mono rounded-b-lg border border-gray-400 p-2 min-h-[200px] md:min-h-[370px]"
              type="text"
            />
            <button
              onClick={() => handlePaste(setUserPayLoad, setIsTokenPasted)}
              className="absolute bottom-1 right-1 bg-white rounded-lg p-2"
            >
              {!isTokenPasted ? <PasteIcon /> : <PastedIcon />}
            </button>
          </div>
        </div>
        <RippleButton
          onClick={EncodeJWT}
          rippleClass="bg-[#51be95]"
          className={`h-full md:hidden block font-bold text-sm rounded-full bg-[#44B78B] ${!isLoading ? "py-[23px]" : "py-[19px]" }`}
        >
          <div className="flex relative space-x-2 justify-center items-center ">
            <span
              className={`${
                !isLoading ? "block" : "hidden"
              } transition-all duration-300 absolute`}
            >
              Encode
            </span>
            <div className={`${!isLoading ? "hidden" : ""} flex space-x-2`}>
              <div class="h-2 w-2 bg-white rounded-full animate-bounce2 [animation-delay:-0.3s]"></div>
              <div class="h-2 w-2 bg-white rounded-full animate-bounce2 [animation-delay:-0.15s]"></div>
              <div class="h-2 w-2 bg-white rounded-full animate-bounce2"></div>
            </div>{" "}
          </div>
        </RippleButton>
        <div className="flex flex-col gap-3">
          <div>
            <p className="py-[6px] px-[8px] uppercase text-[15px] md:text-[13px] font-thin w-full border-t border-r border-l border-gray-400">
              JWT
            </p>
            <textarea
              ref={jwtTokenRef}
              readOnly
              defaultValue={userJWTData.token}
              className="encoded-jwt border text-[22px] outline-none w-full rounded-b-lg overflow-auto border-gray-400 px-5 min-h-[300px] json-view overflow-auto"
              style={{ whiteSpace: "pre-wrap" }}
            />
          </div>
          <RippleButton
            onClick={async () => {
              if (!userJWTData.token) {
                setAlertInfo({
                  message: "Nothing to copy",
                  type: "info",
                  isShow: true,
                });
                return;
              }

              try {
                await navigator.clipboard.writeText(userJWTData.token);
                setAlertInfo({
                  message: "Copied",
                  type: "success",
                  isShow: true,
                });
              } catch (error) {
                console.error("Failed to copy JWT:", error);
                setAlertInfo({
                  message: "Failed to copy",
                  type: "error",
                  isShow: true,
                });
              }
            }}
            rippleClass="bg-[#51be95]"
            className="h-full font-bold text-sm md:text-[15px] rounded-full bg-[#44B78B] py-3 md:p-0"
          >
            <span>Copy JWT</span>
          </RippleButton>
        </div>
      </div>
    </div>
    {alertInfo.isShow && <Alert alertInfo={alertInfo} />}
  </div>
  );
};

export default DecoderTool;