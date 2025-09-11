"use client";
import React, { useEffect, useState } from "react";
import JwtEditor from "@/components/JwtEditor";
import { cn } from "@/lib/utils";
import { Alert, Tab, Tabs, Textarea } from "@heroui/react";
import { PasteButton } from "@/components/PasteButton";
import { ImportExample } from "./ImportExample";
import { useDecoderStore } from "../store";
import { CodeBlock } from "@/components/Code";
import Skeleton from "./Skeleton";

const JWTDecoder = () => {
  const {
    jwt,
    key,
    isVerified,
    decodedToken,
    actions: { setKey, setJwt, decode, verifySignature },
  } = useDecoderStore();
  const [isMounting, setIsMounting] = useState(true);

  useEffect(() => {
    setIsMounting(false);
    decode();
    verifySignature();
  }, []);

  const isNone = decodedToken?.algorithm === "none";

  if (isMounting) return <Skeleton />;

  return (
    <section className="mt-24">
      <div className="flex flex-col gap-4">
        {!isNone ? (
          <>
            <Textarea
              label={"Signature (Secret/PEM/JWK)"}
              minRows={8}
              maxRows={8}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              variant="bordered"
              classNames={{
                label: "select-none !text-default-600",
                inputWrapper: "!border-border/75 border-1 bg-muted/30",
              }}
            />
            <Alert
              color={isVerified ? "success" : "danger"}
              variant="faded"
              title={isVerified ? "Signature Valid" : "Signature Invalid"}
            />
          </>
        ) : null}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col relative">
            <Tabs
              selectedKey={"jwt"}
              classNames={{
                tabList: "border-border/75 border-1 bg-muted/30",
                panel: "pb-0 px-0 h-full min-h-[300px]",
                tab: "data-[key=jwt]:hidden",
              }}
            >
              {[
                {
                  id: "jwt",
                  label: "JWT",
                  content: (
                    <JwtEditor jwt={jwt} onJwtChange={setJwt} label="Token" />
                  ),
                },
                {
                  id: "paste",
                  label: (
                    <PasteButton
                      onPaste={(text) => {
                        setJwt(text);
                      }}
                      className="px-2"
                    />
                  ),
                  tabClassName: "p-0",
                  content: null,
                },
                {
                  id: "import",
                  label: <ImportExample className="px-2" />,
                  tabClassName: "p-0",
                  content: null,
                },
              ].map((item) => (
                <Tab
                  key={item.id}
                  title={item.label}
                  className={cn("[&>div]:flex", item?.tabClassName)}
                >
                  {item.content}
                </Tab>
              ))}
            </Tabs>
          </div>
          <div className="flex flex-col gap-6">
            <CodeBlock
              label="Header"
              className="has-data-[slot=card-content]:h-[300px] has-data-[slot=card-content]:overflow-hidden"
              code={
                decodedToken?.header
                  ? JSON.stringify(decodedToken.header, null, 2)
                  : "{}"
              }
            />
            <CodeBlock
              label="Payload"
              className="has-data-[slot=card-content]:h-[300px] has-data-[slot=card-content]:overflow-hidden"
              code={
                decodedToken?.payload
                  ? JSON.stringify(decodedToken.payload, null, 2)
                  : "{}"
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default JWTDecoder;
