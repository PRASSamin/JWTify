import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/providers";
import { Edu_AU_VIC_WA_NT_Hand, Poppins } from "next/font/google";
import NavigationBar from "@/components/NavigationBar";
import Footer from "@/components/Footer";
import { NAME } from "@/constants";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const edu = Edu_AU_VIC_WA_NT_Hand({
  variable: "--font-edu",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#09090b",
};

const title = `${NAME} | Modern Cryptography Tools`;
const description = `${NAME} is your advanced crypto playground, built to make cryptography simple. Encode and decode tokens, generate keys, and explore powerful security tools, all in one place.`;

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/favicons/favicon-96x96.png", sizes: "96x96" },
      { url: "/favicons/favicon-192x192.png", sizes: "192x192" },
      { url: "/favicons/favicon-512x512.png", sizes: "512x512" },
      { url: "/favicons/favicon.svg" },
    ],
    shortcut: ["/favicons/favicon.svg"],
    apple: [
      {
        url: "/favicons/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
  manifest: "/favicons/site.webmanifest",
  publisher: "PRAS",
  creator: "PRAS",
  authors: [
    {
      name: "PRAS",
      url: "https://pras.me",
    },
  ],
  appleWebApp: {
    title: NAME,
  },
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description,
  },
  twitter: {
    card: "summary_large_image",
    title: title,
    description: description,
    creator: "@prassamin78",
  },
  verification: {
    google: "1Hibq62KV62bSjoXtQEEWNH7oArNJYkycmuyJ2yOaW4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${edu.variable} antialiased dark`}>
        <Provider>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/5 -translate-y-1/1 w-[600px] bg-gradient-to-br from-emerald-600  h-[600px] rounded-full z-0" />
          <div className="w-full backdrop-blur-[100px] bg-black/50 fixed top-0 left-0 h-screen z-1" />
          <NavigationBar />
          <main className="relative z-10">{children}</main>
          <Footer />
        </Provider>
      </body>
    </html>
  );
}
