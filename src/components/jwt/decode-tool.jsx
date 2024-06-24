import React, { useState, useEffect, useRef } from "react";
import "../jwt/Converter.css";
import { verifyES256, verifyES384, verifyES512, verifyRS384, verifyRS512, verifyRS256, verifyHS256, decodeJWTPart, verifyHS512, verifyHS384 } from "../utils";
import Alert from "../global/alert";

const DecoderTool = () => {
  const LoadEnv = import.meta.env.VITE_TOKEN_TEXTS;
  const PlainText = JSON.parse(LoadEnv);
  const { tokens, keys } = PlainText;

  const defaultTokens = {
    HS256: tokens.HS256, HS384: tokens.HS384, HS512: tokens.HS512,
    RS256: tokens.RS256, RS384: tokens.RS384, RS512: tokens.RS512,
    ES256: tokens.ES256, ES384: tokens.ES384, ES512: tokens.ES512,
  };

  const defaultSecretKeys = {
    HS256: keys.HS256, HS384: keys.HS384, HS512: keys.HS512,
    RS256: { key: keys.RS256 }, RS384: { key: keys.RS384 }, RS512: { key: keys.RS512 },
    ES256: { key: keys.ES256 }, ES384: { key: keys.ES384 }, ES512: { key: keys.ES512 },
  };

  const [userJWTData, setUserJWTData] = useState({ token: defaultTokens["HS256"], algorithm: "HS256" });
  const [secretKey, setSecretKey] = useState(defaultSecretKeys["HS256"]);
  const [decodedHeader, setDecodedHeader] = useState({});
  const [decodedPayload, setDecodedPayload] = useState({});
  const [decodedSignature, setDecodedSignature] = useState("");
  const [verificationResult, setVerificationResult] = useState("");
  const [TokenInputFocused, setTokenInputFocused] = useState(false);
  const [isWantVerify, setIsWantVerify] = useState(false);
  const [alertInfo, setAlertInfo] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [isTokenPasted, setIsTokenPasted] = useState(false);
  const [isSecretKeyPasted, setIsSecretKeyPasted] = useState(false);
  const [sKey, setSKey] = useState("");
  const [cursorPosition, setCursorPosition] = useState(null);

  const dropdownRef = useRef(null);
  const textareaRef = useRef(null);

  const algorithmOptions = [
    { label: "HS256", value: "HS256" }, { label: "HS384", value: "HS384" }, { label: "HS512", value: "HS512" },
    { label: "RS256", value: "RS256" }, { label: "RS384", value: "RS384" }, { label: "RS512", value: "RS512" },
    { label: "ES256", value: "ES256" }, { label: "ES384", value: "ES384" }, { label: "ES512", value: "ES512" },
    { label: "PS256", value: "PS256" }, { label: "PS384", value: "PS384" }, { label: "PS512", value: "PS512" },
  ];

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

  const handleDecode = (token) => {
    try {
      const parts = token.split(".");
      if (parts.length >= 2) {
        setDecodedHeader(decodeJWTPart(parts[0]));
        setDecodedPayload(decodeJWTPart(parts[1]));
        setDecodedSignature(parts[2] || "");
      } else {
        throw new Error("Invalid token format");
      }
    } catch (e) {
      setDecodedHeader({});
      setDecodedPayload({});
      setDecodedSignature("");
      console.log(e)
    }
  };

  useEffect(() => {
    handleDecode(userJWTData.token);
  }, [userJWTData.token]);

  useEffect(() => {
    const { alg } = decodedHeader;
    if (alg) {
      setUserJWTData((prev) => ({ ...prev, algorithm: alg }));
      setSecretKey(defaultSecretKeys[alg] || "");
    }
  }, [decodedHeader]);

  const PasteToken = async () => {
    try {
      const token = await navigator.clipboard.readText();
      setUserJWTData((prev) => ({ ...prev, token }));
      setIsTokenPasted(true);
      setAlertInfo({ type: "info", message: "Paste success", isShow: true });
      setTimeout(() => {
        setIsTokenPasted(false);
      }, 2500);
    } catch (e) {
      setAlertInfo({ type: "error", message: "Paste failed: " + e.message, isShow: true });
    }
  };

  const PasteSecretKey = async () => {
    try {
      const key = await navigator.clipboard.readText();
      setSecretKey({ key: key });
      setIsSecretKeyPasted(true);
      setAlertInfo({ type: "info", message: "Paste success", isShow: true });
      setTimeout(() => {
        setIsSecretKeyPasted(false);
      }, 2500);
    } catch (e) {
      setAlertInfo({ type: "error", message: "Paste failed: " + e.message, isShow: true });
    }
  };

  const handleVerify = async () => {
    try {
      if (isWantVerify) {
        let isValid = false;
        switch (userJWTData.algorithm) {
          case "HS256": isValid = await verifyHS256(userJWTData.token, secretKey); break;
          case "RS256": isValid = await verifyRS256(userJWTData.token, secretKey); break;
          case "HS512": isValid = await verifyHS512(userJWTData.token, secretKey); break;
          case "HS384": isValid = await verifyHS384(userJWTData.token, secretKey); break;
          case "RS384": isValid = await verifyRS384(userJWTData.token, secretKey); break;
          case "RS512": isValid = await verifyRS512(userJWTData.token, secretKey); break;
          case "ES256": isValid = await verifyES256(userJWTData.token, secretKey); break;
          case "ES384": isValid = await verifyES384(userJWTData.token, secretKey); break;
          case "ES512": isValid = await verifyES512(userJWTData.token, secretKey); break;
          default: throw new Error(`Unsupported algorithm: ${userJWTData.algorithm}`);
        }
        setVerificationResult(isValid ? "Valid" : "Invalid");
      } else {
        setVerificationResult("");
      }
    } catch (error) {
      console.log(error)
      setAlertInfo({ type: "error", message: error.message, isShow: true });
    }
  };

  useEffect(() => {
    handleVerify();
  }, [userJWTData.token, userJWTData.algorithm, secretKey, isWantVerify]);

  const syntaxHighlight = (json) => {
    if (typeof json !== "string") {
      json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const jsonRegex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g;
    return json.replace(jsonRegex, (match) => {
      let cls = "json-number";
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? "json-key" : "json-string";
      } else if (/true|false/.test(match)) {
        cls = "json-boolean";
      } else if (/null/.test(match)) {
        cls = "json-null";
      }
      return match.includes("http://") || match.includes("https://")
        ? `<a target='_blank' class="${cls}" href=${match}>${match}</a>`
        : `<span class="${cls}">${match}</span>`;
    });
  };

  const handleOptionSelect = (selectedValue) => {
    const selectedToken = defaultTokens[selectedValue];
    const selectedKey = defaultSecretKeys[selectedValue];
  
    setUserJWTData((prev) => ({
      ...prev,
      algorithm: selectedValue,
      token: selectedToken,
    }));
  
    if (selectedKey) {
      setSecretKey(selectedKey.key || selectedKey);
      setSKey(selectedKey.key || selectedKey);
    } else {
      setSecretKey("");
      setSKey("");
    }
  
    setIsOpen(false);
  };

  useEffect(() => {
    setSKey(secretKey.key || secretKey);
  }, [secretKey]);
  
  useEffect(() => {
    if (cursorPosition !== null && textareaRef.current) {
      textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [sKey, cursorPosition]);

  return (
    <div id="decoder" data-name="Decoder" className="mt-24">
      <div className="lg:container w-[95%] md:w-[80%] mx-auto flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col gap-4 justify-start md:w-[25%]">
            <div className="flex flex-col w-full relative">
              <div className={`${!isWantVerify ? "cursor-not-allowed opacity-50 " : "hidden"} rounded-b-lg bg-gray-300 w-full h-full absolute z-40`} />
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
                      {userJWTData.algorithm}
                      <svg
                        className={`w-4 h-4 ml-2 inline-block transform ${isOpen ? "rotate-180" : "rotate-0"}`}
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
                            className={`option relative py-[6px] px-[8px] text-[13px] font-medium cursor-pointer ${
                              ["PS256", "PS384", "PS512"].includes(option.value) ? "" : "hover:bg-gray-200"
                            } ${userJWTData.algorithm === option.value ? "bg-gray-200" : ""} ${
                              ["PS256", "PS384", "PS512"].includes(option.value) ? "disabled-option" : ""
                            }`}
                            onClick={() => {
                              if (!["PS256", "PS384", "PS512"].includes(option.value)) {
                                handleOptionSelect(option.value);
                              }
                            }}
                          >
                            {option.label}
                            {["PS256", "PS384", "PS512"].includes(option.value) && (
                              <div className="cursor-not-allowed w-full h-full absolute top-0 left-0">
                                <p className="py-[3px] px-[8px] bg-yellow-200 rounded-full border border-yellow-800 text-[10px] absolute top-1/2 right-3 transform -translate-y-1/2 text-yellow-800 font-bold text-center opacity-100 z-20">
                                  Coming Soon
                                </p>
                                <div className="disabled-overlay absolute top-0 left-0 w-full h-full bg-gray-300 opacity-30 z-10" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="">
              <label htmlFor="verify" className="inline-block h-6 relative">
                <input
                  type="checkbox"
                  className={`w-11 h-0 cursor-pointer inline-block border-0 focus:outline-none dark:focus:outline-none focus:ring-offset-transparent dark:focus:ring-offset-transparent focus:ring-transparent dark:focus:ring-transparent focus-within:ring-0 dark:focus-within:ring-0 focus:shadow-none dark:focus:shadow-none after:absolute before:absolute after:top-0 before:top-0 after:block before:inline-block before:rounded-full after:rounded-full after:content-[''] after:w-5 after:h-5 after:mt-0.5 after:ml-0.5 after:shadow-md after:duration-100 before:content-[''] before:w-10 before:h-full before:shadow-[inset_0_0_#000] after:bg-white dark:after:bg-gray-50 before:bg-gray-300 dark:before:bg-gray-600 before:checked:bg-lime-500 dark:before:checked:bg-[#00975e] checked:after:duration-300 checked:after:translate-x-4 disabled:after:bg-opacity-75 disabled:cursor-not-allowed disabled:checked:before:bg-opacity-40`}
                  checked={isWantVerify}
                  onChange={() => setIsWantVerify(!isWantVerify)}
                />
                <span className="ml-2 text-[14.5px] font-thin">
                  Verify Signature?
                </span>
              </label>
            </div>
          </div>
          <div className="flex flex-col justify-start md:w-[75%] relative">
            <div
              className={`${
                !isWantVerify ? "cursor-not-allowed opacity-50 " : "hidden"
              } rounded-b-lg bg-gray-300 w-full h-full absolute z-10`}
            />
            <p className="py-[6px] px-[8px] uppercase w-full text-[12px] md:text-[13px] font-thin w-full border-t border-r border-l border-gray-400">
              Key
            </p>
            <textarea
              onChange={(e) => {
                const newValue = e.target.value;
                const newPosition = e.target.selectionStart;
                
                if (userJWTData.algorithm === "HS256" || userJWTData.algorithm === "HS384" || userJWTData.algorithm === "HS512") {
                  setSecretKey(newValue);
                } else {
                  setSecretKey({ key: newValue });
                }
                setSKey(newValue);
                setCursorPosition(newPosition);
              }}

              spellCheck="false"
              value={sKey}
              className="outline-none rounded-b-lg border border-gray-400 p-2 min-h-[120px]"
              style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}
              type="text"
            />
             <button
                onClick={PasteSecretKey}
                className="absolute bottom-1 right-1 bg-white rounded-lg p-2"
              >{ !isSecretKeyPasted ? <PasteIcon /> : <PastedIcon /> }</button>
            <p
              className={`${isWantVerify ? "" : "hidden"} ${
                verificationResult === "Invalid"
                  ? "text-[#ff003d] border-[#ffb3c5] bg-[#ffe5ec]"
                  : "bg-[#b5ffdc] text-[#21bf73] border-[#8eebbe]"
              } font-bold rounded-full text-center border-[1.5px] text-[13px] py-[1.5px] px-[8px] absolute top-1 right-1`}
            >
              {verificationResult === "Invalid"
                ? "Signature is invalid"
                : "Signature is valid"}
            </p>
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
                Token
              </p>
              <textarea
                onChange={(e) => {
                  setUserJWTData((prev) => ({
                    ...prev,
                    token: e.target.value,
                  }));
                  handleDecode(e.target.value);
                }}
                onFocus={() => setTokenInputFocused(true)}
                onBlur={() => setTokenInputFocused(false)}
                value={userJWTData.token}
                spellCheck="false"
                className="encoded-jwt focus:border-blue-600 text-[16px] md:text-[24px] outline-none font-mono rounded-b-lg border border-gray-400 p-2 min-h-[200px] md:min-h-[370px]"
                type="text"
              />
              <button
                onClick={PasteToken}
                className="absolute bottom-1 right-2 bg-white rounded-lg p-2"
              >{ !isTokenPasted ? <PasteIcon /> : <PastedIcon /> }</button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <p className="py-[6px] px-[8px] uppercase text-[12px] md:text-[13px] font-thin w-full border-t border-r border-l border-gray-400">
                Header
              </p>
              <pre
                className="border rounded-b-lg border-gray-400 p-2 min-h-[120px] json-view"
                dangerouslySetInnerHTML={{
                  __html: syntaxHighlight(decodedHeader),
                }}
              />
            </div>
            <div>
              <p className="py-[6px] px-[8px] uppercase text-[12px] md:text-[13px] font-thin w-full border-t border-r border-l border-gray-400">
                Payload
              </p>
              <pre
                className="border rounded-b-lg border-gray-400 p-2 min-h-[200px] json-view"
                dangerouslySetInnerHTML={{
                  __html: syntaxHighlight(decodedPayload),
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {alertInfo.isShow && <Alert alertInfo={alertInfo} />}
    </div>
  );
};

export default DecoderTool;


export const PasteIcon = () => {
  return(
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="currentColor"
        className=""
        viewBox="0 0 16 16"
        >
          <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z" />
          <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z" />
        </svg>
  )
}

export const PastedIcon = () => {
  return(
    <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          className="bi bi-clipboard-check"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0"
          />
          <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z" />
          <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z" />
        </svg>
  )
}