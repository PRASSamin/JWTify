'use client';

import { Skeleton } from '@heroui/react';
import { Card, CardContent } from '@/components/ui/card';
import { CopyButton } from '@/components/CopyButton';

export default function GeneratorSkeleton() {
  return (
    <section className="mt-24">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={index}
              className="rounded-medium bg-muted/50 after:bg-transparent before:via-muted"
            >
              <div className="h-14" />
            </Skeleton>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="py-0 border-border/75 gap-0 bg-card/50 backdrop-blur-lg">
            <div className="!py-2 px-3 uppercase text-xs border-b border-border/75 flex justify-between items-center">
              Private Key
              <CopyButton text={''} />
            </div>
            <CardContent className="p-5 text-sm [&>pre]:whitespace-pre-wrap [&>pre]:break-all [&>pre]:!bg-transparent rounded-md min-h-[220px] overflow-auto"></CardContent>
          </Card>
          <Card className="py-0 border-border/75 gap-0 bg-card/50 backdrop-blur-lg">
            <div className="!py-2 px-3 uppercase text-xs border-b border-border/75 flex justify-between items-center">
              Public Key
              <CopyButton text="" />
            </div>
            <CardContent className="p-5 text-sm [&>pre]:whitespace-pre-wrap [&>pre]:break-all [&>pre]:!bg-transparent rounded-md min-h-[220px] overflow-auto"></CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
