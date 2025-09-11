"use client";

import React from "react";
import { IMPORT_ALGORITHMS, importSimplifiedKey } from "@/lib/key-import";
import { addToast } from "@heroui/react";
import { useEncoderStore } from "../store";
import AlgorithmPicker from "@/components/AlgorithmPicker";

interface ImportButtonProps {
  className?: string;
}

export const ImportButton: React.FC<ImportButtonProps> = ({ className }) => {
  const {
    keyType,
    actions: { importKey, setKeyType },
  } = useEncoderStore();

  const handleImport = async (algorithm: string) => {
    try {
      let type = keyType;
      if (keyType !== "jwk") {
        if (algorithm.startsWith("HS")) {
          setKeyType("secret");
          type = "secret";
        } else {
          setKeyType("pem");
          type = "pem";
        }
      }
      const importedKey = await importSimplifiedKey({
        algorithm,
        keyType: type,
      });

      importKey({
        privateKey: importedKey.privateKey,
        publicKey: importedKey.publicKey,
        keyType: importedKey.keyType,
        algorithm: importedKey.algorithm,
      });

      addToast({
        title: "Key Imported",
        description: `${algorithm} key imported successfully`,
        color: "success",
      });
    } catch (error: any) {
      console.error("Import error:", error);
      addToast({
        title: "Import Failed",
        description: error.message || "Failed to import key",
        color: "danger",
      });
    }
  };

  return (
    <AlgorithmPicker
      algorithms={IMPORT_ALGORITHMS}
      className={className}
      onImport={handleImport}
    />
  );
};
