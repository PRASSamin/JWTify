"use client";
import { Button } from "@heroui/react";
import { Github } from "./icons/github";
import { Link } from "@/components/Link";
import Image from "next/image";
import { ChevronDown, Menu, X } from "lucide-react";
import React, { FC, useEffect, useRef } from "react";
import { cn } from "@heroui/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { tools } from "@/lib/tools/source";
import { animated, useTransition } from "react-spring";
import { REPO_URL } from "@/constants";

const NavigationBar: FC<React.ComponentPropsWithoutRef<"div">> = ({
  className,
  ...props
}) => {
  const toolboxRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [toolBoxOpen, setToolBoxOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [drawerOpen]);

  const transitions = useTransition(drawerOpen, {
    from: { opacity: 0, transform: "translateX(-100%)" },
    enter: { opacity: 1, transform: "translateX(0%)" },
    leave: { opacity: 0, transform: "translateX(-100%)" },
    config: { tension: 300, friction: 30 },
  });

  const backdropTransitions = useTransition(drawerOpen, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  return (
    <div
      className={cn(
        "w-full bg-background/50 backdrop-blur-sm border-b border-border/50 py-3 relative z-20",
        className
      )}
      {...props}
    >
      <div className="w-[calc(100vw-2rem)] lg:w-[calc(100vw-10rem)] mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href={"/"} className="flex items-center gap-2">
          <Image
            className="h-8 w-auto"
            src={"logo.svg"}
            width={250}
            priority
            height={250}
            alt="pras-logo"
          />
        </Link>

        {/* Desktop menu */}
        <div className="flex items-center gap-4 md:gap-10">
          {/* Tools Dropdown */}
          <div
            onMouseEnter={() => setToolBoxOpen(true)}
            onMouseLeave={(e) => {
              const relatedTarget = e.relatedTarget as HTMLElement | null;
              if (
                !relatedTarget ||
                !popoverRef.current?.contains(relatedTarget)
              ) {
                setToolBoxOpen(false);
              }
            }}
            className="hidden md:block"
          >
            <Popover open={toolBoxOpen} onOpenChange={setToolBoxOpen}>
              <PopoverTrigger
                ref={toolboxRef as any}
                className="outline-none flex items-center gap-2"
              >
                Tools
                <ChevronDown
                  className={cn(
                    "size-4 transition-all duration-300",
                    toolBoxOpen && "rotate-180"
                  )}
                />
              </PopoverTrigger>
              <PopoverContent
                ref={popoverRef}
                aria-label="tool-box"
                className="mt-2 max-w-[500px] w-auto p-3 rounded-xl bg-popover/80 backdrop-blur-md border border-border/50 shadow-lg"
              >
                <ul className="grid gap-3 md:grid-cols-2">
                  {tools
                    .getTools()
                    .sortBy("priority", "desc")
                    .slice(0, 5)
                    .map((tool) => (
                      <ListItem
                        key={tool.slug}
                        title={tool.title}
                        href={tool.url}
                        className="p-2 rounded-lg hover:bg-muted/30 transition-all duration-200"
                      >
                        {tool?.description}
                      </ListItem>
                    ))}
                  {tools.getTools().length > 5 && (
                    <Link
                      href="/tools"
                      className="p-2 rounded-lg hover:bg-muted/30 transition-all duration-200 text-center text-sm font-bold"
                    >
                      See More
                    </Link>
                  )}
                </ul>
              </PopoverContent>
            </Popover>
          </div>

          {/* Divider */}
          <div className="hidden md:block h-[40px] w-px bg-muted-foreground/40" />

          {/* Github button */}
          <Button
            className="cursor-pointer rounded-lg transition-all duration-300 hidden md:flex min-w-auto aspect-square p-0"
            variant={"light"}
            size={"md"}
            as={"a"}
            target="_blank"
            href={REPO_URL}
          >
            <Github className="!size-5" />
          </Button>

          {/* Mobile menu button */}
          <button onClick={() => setDrawerOpen(true)} className="md:hidden">
            <Menu className="cursor-pointer hover:bg-muted/50 !size-10 p-1 rounded duration-300" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {backdropTransitions(
        (styles, item) =>
          item && (
            <animated.div
              style={styles}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 w-screen h-screen bg-black/75 z-40"
            />
          )
      )}
      {transitions(
        (styles, item) =>
          item && (
            <animated.div
              style={styles}
              className="fixed top-0 left-0 h-screen md:w-1/3 w-[75vw] sm:w-[50vw] bg-background shadow-xl z-50 flex flex-col overflow-auto"
            >
              <div className="flex justify-between items-center px-4 py-3 border-b border-border/50">
                <span className="font-semibold text-lg">Menu</span>
                <button onClick={() => setDrawerOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                {tools
                  .getTools()
                  .sortBy("title")
                  .map((tool) => (
                    <Link
                      key={tool.slug}
                      href={tool.url}
                      onClick={() => setDrawerOpen(false)}
                      className="block p-3 rounded-lg hover:bg-muted/30 transition-all duration-200"
                    >
                      <div className="font-medium">{tool.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {tool?.description}
                      </div>
                    </Link>
                  ))}
              </nav>

              <div className="px-4 py-3 border-t border-border/50">
                <Button
                  className="w-full rounded-lg flex items-center"
                  target="_blank"
                  variant="flat"
                  href={REPO_URL}
                  as="a"
                >
                  <Github className="mr-1 h-4.5 w-4.5" /> GitHub
                </Button>
              </div>
            </animated.div>
          )
      )}
    </div>
  );
};

export default NavigationBar;

const ListItem = ({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) => {
  return (
    <Link href={href}>
      <li {...props}>
        <div className="text-sm leading-none font-medium">{title}</div>
        <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
          {children}
        </p>
      </li>
    </Link>
  );
};
