"use client";
import React, { Suspense } from "react";
import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/react";
import { Progress } from "@/components/Progress";
import { AnalyticsProvider } from "./AnalyticsProvider";

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <HeroUIProvider>
      <Suspense fallback={null}>
        <Progress />
      </Suspense>
      <ToastProvider />
      {children}
      <AnalyticsProvider />
    </HeroUIProvider>
  );
};

export default Provider;
