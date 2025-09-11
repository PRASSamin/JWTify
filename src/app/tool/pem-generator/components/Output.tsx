'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CopyButton } from '@/components/CopyButton';
import { usePemStore } from '../store';

const PemOutput = () => {
  const { privateKey, publicKey } = usePemStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="py-0 border-border/75 gap-0 bg-card/50 backdrop-blur-lg">
        <div className="!py-2 px-3 uppercase text-xs border-b border-border/75 gap-0 select-none w-full flex justify-between items-center text-muted-foreground">
          Private Key
          <CopyButton text={privateKey} />
        </div>
        <CardContent className="p-5">
          <pre className="text-sm whitespace-pre-wrap break-all rounded-md min-h-[220px] overflow-auto">
            {privateKey || ''}
          </pre>
        </CardContent>
      </Card>

      <Card className="py-0 border-border/75 gap-0 bg-card/50 backdrop-blur-lg">
        <div className="!py-2 px-3 uppercase text-xs border-b border-border/75 gap-0 select-none w-full flex justify-between items-center text-muted-foreground">
          Public Key
          <CopyButton text={publicKey} />
        </div>
        <CardContent className="p-5">
          <pre className="text-sm whitespace-pre-wrap break-all rounded-md min-h-[220px] overflow-auto">
            {publicKey || ''}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default PemOutput;
