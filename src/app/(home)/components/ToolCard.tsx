"use client";
import { animated, useSpring } from "react-spring";
import { Link } from "../../../components/Link";
import { useState } from "react";

interface ToolCardProps {
  title: string;
  description?: string;
  url: string;
}

export const ToolCard = ({ title, description, url }: ToolCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const styles = useSpring({
    transform: isHovered
      ? "scale(1.05) translateY(-5px)"
      : "scale(1) translateY(0px)",
    config: { tension: 300, friction: 15 },
  });

  return (
    <animated.div
      style={styles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full"
    >
      <Link
        href={url}
        className="block p-6 rounded-xl bg-card/50 backdrop-blur-lg border border-border/75 shadow-lg hover:border-emerald-500/50 transition-all duration-300 h-full"
      >
        <h3 className="text-xl font-bold text-primary">{title}</h3>
        <p className="text-muted-foreground mt-2">{description}</p>
      </Link>
    </animated.div>
  );
};
