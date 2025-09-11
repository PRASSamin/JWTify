import Hero from "@/components/Hero";
import Generator from "./components/Generator";
import { frontmatter } from "./meta";
import PemDoc from "./components/PemDoc";
import { metatag } from "@/lib/metadata";
import { NAME } from "@/constants";

const PEMGeneratorPage = () => {
  return (
    <div className="lg:container w-[95%] md:w-[90%] mx-auto ">
      <Hero title={frontmatter.title} description={frontmatter.description} />
      <Generator />
      <PemDoc />
    </div>
  );
};

export default PEMGeneratorPage;

export const generateMetadata = async () => {
  return await metatag({
    title: `${frontmatter.title} | ${NAME}`,
    robots: "index, follow",
    description: frontmatter.description,
    keywords: [
      "pem generator",
      "pem",
      "pem online tool",
      "pem generator online",
      "pem key generator online",
      "rsa pem key generator",
      "ecdsa pem key generator",
      "pem private key generator",
      "pem public key generator",
      "generate pkcs1 pkcs8 pem",
      "convert pem to der",
      "pem key with passphrase",
      "pem certificate generator",
      "pem for jwt",
    ],
  });
};