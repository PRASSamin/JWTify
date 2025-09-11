import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";

const AnalyticsProvider = ({ children }: { children?: React.ReactNode }) => {
  return (
    <>
      <GoogleAnalytics gaId="G-M92LE3MPT2" />
      <VercelAnalytics />
      {children}
    </>
  );
};

export { AnalyticsProvider };
