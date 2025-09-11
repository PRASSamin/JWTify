"use client";
import NextLink from "next/link";
import NProgress from "nprogress";

import { addBasePath } from "next/dist/client/add-base-path";
import React from "react";
import { cn } from "@/lib/utils";

function getURL(href: string) {
  return new URL(addBasePath(href), location.href);
}

// https://github.com/vercel/next.js/blob/400ccf7b1c802c94127d8d8e0d5e9bdf9aab270c/packages/next/src/client/link.tsx#L169
function isModifiedEvent(
  event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
) {
  const eventTarget = event.currentTarget;
  const target = eventTarget.getAttribute("target");
  return (
    (target && target !== "_self") ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey || // triggers resource download
    (event.nativeEvent && event.nativeEvent.button === 1)
  );
}

export function shouldTriggerStartEvent(
  href: string,
  clickEvent: React.MouseEvent<HTMLAnchorElement, MouseEvent>
) {
  const current = window.location;
  const target = getURL(href);

  if (clickEvent && isModifiedEvent(clickEvent)) return false; // modified events: fallback to browser behaviour
  if (current.origin !== target.origin) return false; // external URL
  if (current.pathname === target.pathname && current.search === target.search)
    return false; // same URL

  return true;
}

export const Link = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof NextLink> & { variant?: "fuma" }
>(({ onClick, href, className, variant, ...props }, ref) => {
  const useLink = href && (href as string).startsWith("/");
  if (!useLink)
    return (
      <a
        className={cn(
          variant === "fuma"
            ? "underline underline-offset-4 text-foreground font-medium decoration-2 decoration-emerald-300 hover:opacity-80"
            : "",
          className
        )}
        href={href as string}
        onClick={onClick}
        {...props}
      />
    );

  return (
    <NextLink
      className={cn(
        variant === "fuma"
          ? "underline underline-offset-4 text-foreground font-medium decoration-2 decoration-emerald-300 hover:opacity-80"
          : "",
        className
      )}
      href={href as any}
      onClick={(event) => {
        if (shouldTriggerStartEvent(href as string, event)) NProgress.start();
        if (onClick) onClick(event);
      }}
      {...props}
      ref={ref}
    />
  );
});

Link.displayName = "Link";
