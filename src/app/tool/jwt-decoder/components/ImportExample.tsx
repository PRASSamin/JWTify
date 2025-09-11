"use client";

import React from "react";
import { EXAMPLE_ALGORITHMS, useDecoderStore } from "../store";
import AlgorithmPicker from "@/components/AlgorithmPicker";

interface ImportExampleProps {
  className?: string;
}

export const ImportExample: React.FC<ImportExampleProps> = ({ className }) => {
  const {
    actions: { importExample },
  } = useDecoderStore();

  return (
    <AlgorithmPicker
      algorithms={EXAMPLE_ALGORITHMS}
      className={className}
      onImport={(data) => importExample({ algorithm: data })}
    />
  );
};
