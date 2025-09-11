"use client";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false });
NProgress.setColor = (color) => {
  if (typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent = `
  #nprogress .bar {
    background: ${color} !important;
  }
  `;
  document.body.appendChild(style);
};

NProgress.configure({ showSpinner: false });
NProgress.setColor("var(--color-emerald-600)");
export function Progress() {
  const pathname = usePathname();
  const renderId = useRef(Date.now());
  const searchParams = useSearchParams();
  useEffect(() => {
    NProgress.done();
    return () => {
      NProgress.remove();
    };
  }, [pathname, searchParams, renderId.current]);
  return null;
}
