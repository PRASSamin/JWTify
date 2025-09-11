"use client";

import { useEffect, useState } from "react";
import { Select, SelectItem, Alert } from "@heroui/react";
import { LoadingButton } from "@/components/LoadingButton";
import { usePemStore, ALGORITHMS } from "../store";
import { RsaOptions } from "./algorithm-options/RsaOptions";
import { CurveOptions } from "./algorithm-options/CurveOptions";
import { PkcsOptions } from "./algorithm-options/PkcsOptions";
import PemOutput from "./Output";
import GeneratorSkeleton from "./GeneratorSkeleton";
import { ExportButton } from "./ExportButton";

export default function Generator() {
  const { algorithm, keySize, loading, actions, curve, pkcsVersion } =
    usePemStore();
  const { generate, setAlgorithm } = actions;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    generate();
  }, [algorithm, keySize, curve, pkcsVersion]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showKeySize =
    algorithm.startsWith("RS") ||
    algorithm.startsWith("PS") ||
    algorithm.startsWith("RSA-OAEP");
  const showCurve =
    algorithm.startsWith("ES") ||
    algorithm.startsWith("Ed") ||
    algorithm.startsWith("ECDH");
  const showPkcsVersion =
    algorithm.startsWith("RS") ||
    algorithm.startsWith("PS") ||
    algorithm.startsWith("RSA-OAEP");

  if (!isMounted) return <GeneratorSkeleton />;

  return (
    <div className="mt-24">
      <div className="flex flex-col gap-4">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Algorithm"
            selectedKeys={[algorithm]}
            variant="bordered"
            classNames={{
              trigger: "!border-border/75 border-1 bg-muted/30",
            }}
            onChange={(e) => {
              if (e.target.value) {
                setAlgorithm(e.target.value);
              }
            }}
          >
            {ALGORITHMS.map((option) => (
              <SelectItem key={option.value}>{option.label}</SelectItem>
            ))}
          </Select>

          {showKeySize && <RsaOptions />}
          {showPkcsVersion && <PkcsOptions />}
          {showCurve && <CurveOptions />}
        </div>

        <div className="flex items-center gap-4">
          <LoadingButton text="Generate" loading={loading} onPress={generate} />
          <ExportButton />
        </div>

        {keySize === 8192 && (
          <Alert
            color="warning"
            variant="faded"
            title="Generating an 8192-bit RSA key is resource-intensive and may slow your browser."
            className="border-warning-100 bg-warning-50/50"
          />
        )}

        {/* Key Output */}
        <PemOutput />
      </div>
    </div>
  );
}
