"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectItem,
  Input,
  Alert,
  addToast,
  Button,
} from "@heroui/react";
import { LoadingButton } from "@/components/LoadingButton";
import { Download, RotateCw } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useJwkStore, ALGORITHMS, allKeyOps } from "../store";
import { RsaOptions } from "./algorithm-options/RsaOptions";
import { OctOptions } from "./algorithm-options/OctOptions";
import { JwkKeyOpsHelper, KEY_OPS } from "@/lib/jwk";
import { isOCTAlgo } from "@/lib/keypair";
import JwkOutput from "./Output";
import GeneratorSkeleton from "./GeneratorSkeleton";
import { CurveOptions } from "./algorithm-options/CurveOptions";

export default function JWKGenerator() {
  const {
    algorithm,
    kid,
    useKey,
    keyOps,
    jwkPrivate,
    jwkPublic,
    jwkSet,
    loading,
    actions,
    keySize,
    curve,
    octSize,
  } = useJwkStore();

  const { generate, setAlgorithm } = actions;
  const opsHelper = new JwkKeyOpsHelper(algorithm, keyOps);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    generate();
  }, [algorithm, kid, keyOps, keySize, curve, octSize]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDownload = () => {
    const isOct = isOCTAlgo(algorithm);
    if (!jwkPublic || !jwkSet) {
      addToast({
        title: "Please generate keys first",
        description: "Click the generate button to create new keys.",
        color: "danger",
      });
      return;
    }

    try {
      const zip = new JSZip();
      if (!isOct) zip.file("private.json", JSON.stringify(jwkPrivate, null, 2));
      zip.file(
        `${isOct ? "shared" : "public"}.json`,
        JSON.stringify(jwkPublic, null, 2)
      );
      zip.file("jwks.json", JSON.stringify(jwkSet, null, 2));

      zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, `jwtify-jwk-${algorithm}-${kid}.zip`);
      });
    } catch (err: any) {
      console.error(err);
      addToast({
        title: "Download Error",
        description: "Could not create the zip file.",
        color: "danger",
      });
    }
  };

  const showKeySize = algorithm.startsWith("RS") || algorithm.startsWith("PS");
  const showOKP = algorithm === "EdDSA" || algorithm.startsWith("ECDH");
  const showCurve =
    algorithm.startsWith("ES") ||
    algorithm.startsWith("Ed") ||
    algorithm.startsWith("ECDH");
  const showOct = isOCTAlgo(algorithm);

  if (!isMounted) return <GeneratorSkeleton />;

  return (
    <section className="mt-24">
      <div className="flex flex-col gap-4">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Algorithm"
            selectedKeys={[algorithm]}
            variant="bordered"
            classNames={{
              trigger: "!border-border/75 border-1 bg-muted/40",
            }}
            disabledKeys={ALGORITHMS.filter((opt) => opt.soon).map(
              (opt) => opt.value
            )}
          >
            {ALGORITHMS.map((opt) => (
              <SelectItem
                key={opt.value}
                endContent={
                  opt.soon ? (
                    <span className="text-[8px] text-muted-foreground">
                      Soon
                    </span>
                  ) : null
                }
                onPress={() => {
                  setAlgorithm(opt.value);
                }}
              >
                {opt.label}
              </SelectItem>
            ))}
          </Select>

          {showCurve && <CurveOptions />}
          {showKeySize && <RsaOptions />}
          {showOct && <OctOptions />}

          <div className="relative">
            <Button
              size="sm"
              variant="light"
              className="!bg-transparent aspect-square p-0 min-w-auto overflow-hidden group absolute top-1/2 -translate-y-1/2 right-2 z-10"
              onPress={actions.resetKid}
            >
              <RotateCw
                size={16}
                className="group-active:rotate-360 group-active:scale-125 transition-all duration-400 text-muted-foreground"
              />
            </Button>
            <Input
              label="Key ID"
              value={kid}
              variant="bordered"
              classNames={{
                inputWrapper: "!border-border/75 border-1 bg-muted/40",
              }}
              autoCorrect="off"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
              onChange={(e) => actions.setKid(e.target.value)}
            />
          </div>
          <Select
            label="Key Use"
            selectedKeys={[useKey]}
            isDisabled
            variant="bordered"
            classNames={{
              trigger: "!border-border/75 border-1 bg-muted/40",
            }}
            onChange={(e) => actions.setUseKey(e.target.value)}
          >
            <SelectItem key="sig">Signature</SelectItem>
            <SelectItem key="enc">Encryption</SelectItem>
          </Select>

          <Select
            label="Key Ops"
            selectedKeys={keyOps}
            variant="bordered"
            classNames={{
              trigger: "!border-border/75 border-1 bg-muted/40",
            }}
            onChange={(e) =>
              actions.setKeyOps(
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            disabledKeys={
              opsHelper.getAlgoKey()
                ? allKeyOps.filter(
                    (op) =>
                      !KEY_OPS[
                        opsHelper.getAlgoKey() as keyof typeof KEY_OPS
                      ].includes(op)
                  )
                : allKeyOps
            }
            selectionMode="multiple"
          >
            {allKeyOps.map((op) => {
              return <SelectItem key={op}>{op}</SelectItem>;
            })}
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <LoadingButton text="Generate" loading={loading} onPress={generate} />
          <Button
            variant="solid"
            color="secondary"
            size="sm"
            className="flex items-center justify-center px-5 h-10 rounded-xl"
            onPress={handleDownload}
          >
            <Download size={16} />
            Download
          </Button>
        </div>

        {showOKP ? (
          <Alert
            color="primary"
            variant="faded"
            title="This is a key-agreement key (X25519/X448). It's not used for JWT signing; used for ECDH/derive operations."
          />
        ) : null}

        {keySize === 8192 && (
          <Alert
            color="warning"
            variant="faded"
            title={`Generating an 8192 bit RSA key is extremely resource intensive & this may take a while & could slow your browser.`}
            className="border-warning-100 bg-warning-50/50"
          />
        )}

        {/* Output */}
        <JwkOutput />
      </div>
    </section>
  );
}
