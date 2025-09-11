"use client";

import { Skeleton as SK } from "@heroui/react";
import { CodeBlock } from "@/components/Code";

export default function Skeleton() {
  return (
    <section className="mt-24">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="w-full flex flex-col gap-3">
            <SK className="rounded-medium bg-muted/50 after:bg-transparent before:via-muted w-full">
              <div className="h-[200px]" />
            </SK>
            <SK className="rounded-medium bg-muted/50 after:bg-transparent before:via-muted w-full">
              <div className="h-16" />
            </SK>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SK className="rounded-medium bg-muted/50 after:bg-transparent before:via-muted">
            <div className="h-[200px]" />
          </SK>
          <div className="flex flex-col gap-6">
            <CodeBlock
              label="Header"
              className="has-data-[slot=card-content]:h-[300px] has-data-[slot=card-content]:overflow-hidden"
              code={""}
            />
            <CodeBlock
              label="Payload"
              className="has-data-[slot=card-content]:h-[300px] has-data-[slot=card-content]:overflow-hidden"
              code={""}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
