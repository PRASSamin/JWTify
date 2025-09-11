"use client";
import { Button } from "@heroui/react";
import { animated, useSpring } from "react-spring";
import { Github } from "../../../components/icons/github";

export const LandingHero = () => {
  const styles = useSpring({
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    config: { duration: 500 },
  });

  return (
    <div className="w-full pt-28 pb-20 flex flex-col items-center justify-center text-center">
      <animated.div
        style={styles}
        className="lg:container w-[95%] md:w-[80%] mx-auto"
      >
        <h1 className="text-5xl leading-[1.1] md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-green-600">
          Modern Cryptography Tools for Everyone
        </h1>
        <p className="mt-6 text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto">
          JWTify is your advanced crypto playground, built to make cryptography
          simple. Encode and decode tokens, generate keys, and explore powerful
          security tools, all in one place.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button
            as={"a"}
            href="#tools"
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
          >
            Get Started
          </Button>
          <Button
            variant="flat"
            as={"a"}
            href="https://github.com/PRASSamin/jwtify"
            target="_blank"
            className="flex items-center gap-2"
          >
            <Github size={18} /> View on Github
          </Button>
        </div>
      </animated.div>
    </div>
  );
};
