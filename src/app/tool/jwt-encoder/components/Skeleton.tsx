"use client";

import { Skeleton as SK } from "@heroui/react";
import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "@/components/CopyButton";
import { cn } from "@heroui/react";

export default function Skeleton() {
  return (
    <section className="mt-24">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <div
            className={cn(
              "flex flex-col items-center gap-3 col-span-1 w-full",
              "md:w-[45%]"
            )}
          >
            <SK className="rounded-medium bg-muted/50 after:bg-transparent before:via-muted w-full">
              <div className="h-14" />
            </SK>
            <SK className="rounded-medium bg-muted/50 after:bg-transparent before:via-muted w-full">
              <div className="h-10" />
            </SK>
          </div>
          <div className="w-full flex flex-col gap-3">
            <SK className="rounded-medium bg-muted/50 after:bg-transparent before:via-muted w-full">
              <div className="h-10.5" />
            </SK>
            <SK className="rounded-medium bg-muted/50 after:bg-transparent before:via-muted w-full">
              <div className="h-[200px]" />
            </SK>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SK className="rounded-medium bg-muted/50 after:bg-transparent before:via-muted">
            <div className="h-[200px]" />
          </SK>
          <Card className="py-0 border-border/75 gap-0 bg-card/50 backdrop-blur-lg">
            <div className="!py-2 px-3 uppercase text-xs border-b border-border/75 flex justify-between items-center">
              JWT
              <CopyButton text="" />
            </div>
            <CardContent className="p-5 text-sm [&>pre]:whitespace-pre-wrap [&>pre]:break-all [&>pre]:!bg-transparent rounded-md min-h-[220px] overflow-auto"></CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
