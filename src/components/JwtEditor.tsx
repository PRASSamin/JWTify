import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { PasteButton } from "./PasteButton";

interface JwtEditorProps {
  jwt: string;
  onJwtChange?: (value: string) => void;
  label?: string;
  onPaste?: (text: string) => void;
  wrapperClassName?: string;
}

const JwtEditor: React.FC<JwtEditorProps> = ({
  jwt,
  onJwtChange,
  label,
  onPaste,
  wrapperClassName,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync scroll
  const handleScroll = () => {
    if (backdropRef.current && textareaRef.current) {
      backdropRef.current.scrollTo({
        top: textareaRef.current.scrollTop,
        left: textareaRef.current.scrollLeft,
        behavior: "instant",
      });
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.addEventListener("scroll", handleScroll);
    return () => textarea.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      data-slot="editor-full-wrapper"
      data-filled-within={isFocused || jwt ? "true" : "false"}
      className={cn(
        "relative flex tap-highlight-transparent shadow-xs px-3 rounded-medium flex-col gap-0 !duration-150 transition-colors motion-reduce:transition-none py-2 !border-border/75 border-1 bg-muted/30 group h-full",
        wrapperClassName
      )}
    >
      {label && (
        <label className="z-10 pointer-events-none origin-top-left shrink-0 rtl:origin-top-right subpixel-antialiased block cursor-text relative will-change-auto !duration-200 !ease-out motion-reduce:transition-none transition-[transform,color,left,opacity,translate,scale] group-data-[filled-within=true]:text-default-600 group-data-[filled-within=true]:pointer-events-auto group-data-[filled-within=true]:scale-85 text-small pb-0.5 pe-2 max-w-full text-ellipsis overflow-hidden select-none !text-default-600">
          {label}
        </label>
      )}
      <div className="relative h-full" data-slot="editor-wrapper">
        {/* Backdrop layer */}
        <div
          ref={backdropRef}
          data-slot="editor-backdrop-area"
          className="break-words outline-none font-mono whitespace-pre-wrap h-full w-full overflow-hidden pointer-events-none absolute top-0 left-0 z-0 bg-transparent"
        >
          {highlightJWT(jwt)}
        </div>

        {/* Actual textarea */}
        <textarea
          data-slot="editor-textarea"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          ref={textareaRef}
          onChange={(e) => onJwtChange?.(e.target.value)}
          value={jwt}
          autoCorrect="off"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          className="break-words outline-none font-mono whitespace-pre-wrap h-full w-full  text-transparent caret-foreground relative z-10 resize-none overflow-auto antialiased bg-transparent"
        />
      </div>
      {onPaste && (
        <PasteButton
          data-slot="editor-paste-button"
          onPaste={onPaste}
          className="absolute top-2 right-2 z-20"
        />
      )}
    </div>
  );
};

export default JwtEditor;

export const highlightJWT = (token: string) => {
  if (!token) return null;

  return token.split(".").map((part, index) => {
    let color = "var(--foreground)";
    if (index === 0) color = "#ff0000";
    if (index === 1) color = "#800080";
    if (index === 2) color = "#0000ff";

    // Split part by newlines
    const lines = part.split("\n");
    return (
      <React.Fragment key={index}>
        {lines.map((line, i) => (
          <React.Fragment key={i}>
            <span style={{ color, whiteSpace: "pre-wrap" }}>
              {line === "" ? i === lines.length - 1 && <br /> : line}
            </span>
            {/* Add newline except after last line */}
            {i < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
        {index < token.split(".").length - 1 && (
          <span style={{ color: "var(--foreground)" }}>.</span>
        )}
      </React.Fragment>
    );
  });
};
