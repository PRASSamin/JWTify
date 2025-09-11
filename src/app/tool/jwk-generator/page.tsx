import Hero from "@/components/Hero";
import Generator from "./components/Generator";
import JwkDoc from "./components/JwkDoc";
import { frontmatter } from "./meta";
import { metatag } from "@/lib/metadata";
import { NAME } from "@/constants";

const JWKGeneratorPage = () => {
  return (
    <div className="lg:container w-[95%] md:w-[90%] mx-auto ">
      <Hero title={frontmatter.title} description={frontmatter.description} />
      <Generator />
      <JwkDoc />
    </div>
  );
};

export default JWKGeneratorPage;

export const generateMetadata = async () => {
  return await metatag({
    title: `${frontmatter.title} | ${NAME}`,
    robots: "index, follow",
    description: frontmatter.description,
    keywords: [
      "jwk generator online",
      "rsa jwk generator",
      "ec jwk generator",
      "generate jwk for jwt",
      "convert jwk to pem",
      "convert pem to jwk",
      "jwk private key",
      "jwk public key",
      "jwk json key generator",
      "jwt jwk support",
    ],
  });
};
