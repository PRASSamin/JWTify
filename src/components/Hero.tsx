import React from "react";

const Hero = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="w-full pt-20 pb-10 flex flex-col items-center justify-center transition-all duration-300">
      <div className="lg:container  w-[95%] md:w-[80%] mx-auto text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-t from-emerald-600 to-emerald-200">{title}</h1>
        <p className="select-auto text-foreground/70">{description}</p>
      </div>
    </div>
  );
};

export default Hero;
