"use client";

import { useRouter as useRouterImpl } from "next/navigation";
import NProgress from "nprogress";

export const useRouter = () => {
  const router = useRouterImpl();

  const safeWrap = async (fn: () => Promise<void>, href?: string) => {
    if (window.location.pathname === href || !href) return;
    NProgress.start();
    await fn();
  };

  return {
    push: (href: string) => safeWrap(async () => router.push(href), href),
    replace: (href: string) => safeWrap(async () => router.replace(href), href),
    refresh: () => safeWrap(async () => await router.refresh()),
    back: () => safeWrap(async () => router.back()),
    forward: () => safeWrap(async () => router.forward()),
  };
};