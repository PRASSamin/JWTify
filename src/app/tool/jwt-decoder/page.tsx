import Hero from "@/components/Hero";
import JwtDoc from "@/components/JwtDoc";
import { frontmatter } from "./meta";
import JWTDecoder from "./components/Decoder";
import { metatag } from "@/lib/metadata";
import { NAME } from "@/constants";

const DecoderPage = () => {
  return (
    <div className="lg:container w-[95%] md:w-[90%] mx-auto ">
      <Hero title={frontmatter.title} description={frontmatter.description} />
      <JWTDecoder />
      <JwtDoc />
    </div>
  );
};

export default DecoderPage;

export const generateMetadata = async () => {
  return await metatag({
    title: `${frontmatter.title} | ${NAME}`,
    robots: "index, follow",
    description: frontmatter.description,
    keywords: [
      "decode jwt online free",
      "jwt decoder tool",
      "jwt encoder tool",
      "jwt payload decoder",
      "jwt header decoder",
      "jwt signature verifier",
      "hs256 jwt decode",
      "rs256 jwt decode",
      "jwt verify online",
      "debug jwt token",
      "jwt validator online",
      "jwt signature validator",
      "jwt playground",
      "test jwt token",
      "jwt sign and verify",
      "jwt online debugger",
      "jwt algorithm tester",
      "jwt expiry checker",
      "jwt verify RS256",
      "jwt online validation tool",
    ],
  });
};
