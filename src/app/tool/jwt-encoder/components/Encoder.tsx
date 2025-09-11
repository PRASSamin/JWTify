"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, Select, SelectItem } from "@heroui/react";
import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "@/components/CopyButton";
import { LoadingButton } from "@/components/LoadingButton";
import { JsonEditor } from "@/components/JsonEditor";
import { debounce } from "@/lib/utils";
import { cn } from "@heroui/react";
import { useEncoderStore, ALGORITHMS } from "../store";
import KeyTab from "./KeyTab";
import Skeleton from "./Skeleton";
import { CodeBlock } from "@/components/Code";
import { highlightJWT } from "@/components/JwtEditor";

const JWTEncoder = () => {
  const {
    algorithm,
    key,
    payload,
    jwt,
    loading,
    keyType,
    keyValidation,
    publicKey,
    isImported,
    actions,
  } = useEncoderStore();

  const { setAlgorithm, setPayload, generateJWT, validateCurrentKey } = actions;

  const [isMounting, setIsMounting] = useState(true);
  const isInitialRender = useRef(true);

  const isSymmetric = algorithm.startsWith("HS");
  const isNone = algorithm === "none";

  useEffect(() => {
    setIsMounting(false);
  }, []);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    const handler = debounce(() => {
      if (!isNone) {
        validateCurrentKey();
      }
    }, 400);

    handler();
  }, [keyType, key, algorithm, validateCurrentKey, isNone]);

  if (isMounting) return <Skeleton />;

  return (
    <section className="mt-24">
      <div className="flex flex-col gap-4">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <div
            className={cn(
              "flex flex-col items-center gap-3 col-span-1 w-full",
              !isNone && "md:w-[45%]"
            )}
          >
            <Select
              label="Algorithm"
              selectedKeys={[algorithm]}
              variant="bordered"
              classNames={{
                trigger: "!border-border/75 border-1 bg-muted/30",
              }}
              onChange={(e) => setAlgorithm(e.target.value)}
            >
              {ALGORITHMS.map((option) => (
                <SelectItem
                  onClick={() =>
                    algorithm === option.value && setAlgorithm(option.value)
                  }
                  key={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </Select>
            <LoadingButton
              loading={loading}
              onPress={generateJWT}
              text="Encode"
              isDisabled={
                loading || (!isNone && keyValidation.level === "error")
              }
              className="!w-full hidden md:block"
            />
          </div>
          {!isNone && (
            <div className="col-span-2 w-full relative">
              <KeyTab />
            </div>
          )}
        </div>
        {!isNone && keyValidation.level && (
          <Alert
            color={keyValidation.level === "warning" ? "warning" : "danger"}
            title={keyValidation.message}
          />
        )}
        {/* Editor + JWT output */}
        <div
          className={cn(
            "grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2",
            !isNone && !isSymmetric && isImported && "lg:grid-cols-3"
          )}
        >
          <JsonEditor
            label="Payload"
            className="[&_.monaco-editor]:min-h-[220px]"
            onPaste={(text) => setPayload(text)}
            value={payload}
            onChange={(val) => setPayload(val || "{}")}
          />
          <LoadingButton
            loading={loading}
            onPress={generateJWT}
            text="Encode"
            isDisabled={loading || (!isNone && keyValidation.level === "error")}
            className="!w-full md:hidden"
          />
          <Card className="py-0 border-border/75 gap-0 bg-card/50 backdrop-blur-lg">
            <div className="!py-2 px-3 uppercase text-xs border-b border-border/75 gap-0 select-none w-full flex justify-between items-center text-muted-foreground">
              JWT <CopyButton text={jwt} />
            </div>
            <CardContent className="p-5">
              <pre className="text-sm whitespace-pre-wrap break-all rounded-md min-h-[220px] overflow-auto">
                {highlightJWT(jwt) || ""}
              </pre>
            </CardContent>
          </Card>
          {!isNone && !isSymmetric && isImported && publicKey && (
            <CodeBlock label={"Public Key"} code={publicKey} />
          )}
        </div>
      </div>
    </section>
  );
};

export default JWTEncoder;
