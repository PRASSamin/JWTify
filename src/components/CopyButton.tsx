"use client";

import React, { useState } from "react";
import { Button } from "@heroui/react";
import { Copy, Check } from "lucide-react";
import { useTransition, animated } from "react-spring";

export const CopyButton = ({
  text = "",
  disabled = false,
}: {
  text?: string;
  disabled?: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const transitions = useTransition(copied ? "check" : "copy", {
    from: { opacity: 0, transform: "scale(0.5)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(0.5)" },
    config: { tension: 300, friction: 15 },
  });

  return (
    <Button
      onPress={handleClick}
      size="sm"
      disabled={disabled}
      variant="light"
      className="!bg-transparent aspect-square p-0 min-w-auto relative overflow-hidden"
    >
      {transitions((style, item) =>
        item === "copy" ? (
          <animated.div
            style={{ ...style }}
            className={
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            }
          >
            <Copy size={16} className="m-auto text-muted-foreground" />
          </animated.div>
        ) : (
          <animated.div
            style={{ ...style }}
            className={
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            }
          >
            <Check size={18} className="m-auto text-muted-foreground" />
          </animated.div>
        )
      )}
    </Button>
  );
};
