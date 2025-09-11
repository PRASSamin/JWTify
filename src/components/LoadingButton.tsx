"use client";

import { animated, useTransition } from "@react-spring/web";
import { Button, ButtonProps } from "@heroui/react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends ButtonProps {
  loading: boolean;
  text: string;
}

export const LoadingButton = ({
  loading,
  text,
  className,
  color,
  ...props
}: LoadingButtonProps) => {
  const transitions = useTransition(loading ? "generating" : "generate", {
    from: { opacity: 0, transform: "translateY(-10px)" },
    enter: { opacity: 1, transform: "translateY(0px)" },
    leave: { opacity: 0, transform: "translateY(-10px)" },
    config: { tension: 300, friction: 15 },
  });

  return (
    <Button
      color={color || "success"}
      isDisabled={loading}
      className={cn(
        "relative self-start flex items-center justify-center !w-26 overflow-hidden",
        className
      )}
      {...props}
    >
      {transitions((style, item) =>
        item === "generate" ? (
          <animated.div
            style={{ ...style }}
            className={
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            }
          >
            {text}
          </animated.div>
        ) : (
          <animated.div
            style={{ ...style }}
            className={
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            }
          >
            <Loader2 className="animate-spin" size={18} />
          </animated.div>
        )
      )}
    </Button>
  );
};
