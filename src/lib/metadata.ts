import { BASE_URL } from "@/constants";
import { Metadata } from "next";
import { headers } from "next/headers";

export const metatag = async ({
  title,
  robots = "index, follow",
  keywords = [],
  image,
  description,
}: {
  title: string;
  robots?: string;
  keywords?: string[];
  image?: string;
  description?: string;
}): Promise<Metadata> => {
  const headersList = await headers();
  const url = headersList.get("x-current-url");
  const fav = image || `${BASE_URL}/favicons/favicon-512x512-maskable.png`;

  const fixedKeywords = [
    "jwtify",
    "jwt",
    "json web token",
    "jwt online tool",
    "jwt decoder",
    "jwt encoder",
    "jwt generator",
    "jwt validator",
    "jwt sign verify",
    "jwt hs256",
    "jwt rs256",
    "jwt es256",
    "jwt debugger",
    "jws",
    "jwe",
    "json web encryption",
    "jwk",
    "json web key",
    "jwk generator",
    "jwk to pem",
    "pem to jwk",
    "pem",
    "pem generator",
    "rsa pem generator",
    "ec pem generator",
    "rsa key pair generator",
    "ecdsa key generator",
    "private key generator online",
    "public key generator online",
    "jwt playground",
    "what is jwt",
    "jwt tutorial for beginners",
    "how jwt works",
    "pem vs jwk",
    "pkcs1 vs pkcs8 explained",
    "json web token explained",
    "jwt security best practices",
    "jwt example code",
    "jwt implementation guide",
    "pem key explained",
    "pras",
  ];

  const margedkeywords = fixedKeywords.concat(keywords);

  const m: Metadata = {
    title: title,
    keywords: margedkeywords,
    openGraph: {
      title: title,
      url: url!,
      siteName: title,
      images: [
        {
          url: fav,
        },
      ],
      locale: "en-US",
      type: "website",
    },
    twitter: {
      title: title,
      creator: "@prassamin78",
      images: fav,
      card: "summary_large_image",
    },
    alternates: {
      canonical: url,
      languages: { "en-US": url },
    },
    robots: robots,
  };

  if (description) {
    m.description = description;
    m.twitter!.description = description;
    m.openGraph!.description = description;
  }
  return m;
};
