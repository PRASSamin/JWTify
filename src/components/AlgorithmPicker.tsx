"use client";

import React, { useState } from "react";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
} from "@heroui/react";
import { Import, ChevronDown } from "lucide-react";
import { cn } from "@heroui/react";

interface Algorithm {
  value: string;
  label: string;
}

interface AlgorithmPickerProps {
  className?: string;
  algorithms: Algorithm[];
  onImport: (algorithm: string) => Promise<void> | void;
  label?: string;
  labelStartContent?: React.ReactNode;
  labelEndContent?: React.ReactNode;
}

const AlgorithmPicker: React.FC<AlgorithmPickerProps> = ({
  className,
  algorithms,
  onImport,
  label = "Import",
  labelStartContent,
  labelEndContent,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async (algorithm: string) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onImport(algorithm);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  const rsaAlgos = algorithms.filter(
    (a) => a.value.startsWith("RS") || a.value.startsWith("PS")
  );
  const ecdsaAlgos = algorithms.filter((a) => a.value.startsWith("ES"));
  const eddsaAlgos = algorithms.filter((a) => a.value.startsWith("Ed"));
  const hmacAlgos = algorithms.filter((a) => a.value.startsWith("HS"));
  const otherAlgos = algorithms.filter(
    (a) =>
      !a.value.startsWith("HS") &&
      !a.value.startsWith("PS") &&
      !a.value.startsWith("RS") &&
      !a.value.startsWith("ES") &&
      !a.value.startsWith("Ed")
  );

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant="light"
          size="sm"
          className={cn(
            "!bg-transparent p-0 min-w-auto relative overflow-hidden px-2 text-muted-foreground",
            className
          )}
          isDisabled={isLoading}
          startContent={
            labelStartContent || <Import size={16} className="m-auto" />
          }
          endContent={labelEndContent || <ChevronDown size={14} />}
        >
          {label}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Import key algorithms"
        className="max-h-80 overflow-y-auto"
      >
        {rsaAlgos.length > 0 ? (
          <DropdownSection title="RSA Algorithms" showDivider>
            {rsaAlgos.map((algo) => (
              <DropdownItem
                key={`rsa-${algo.value}`}
                className="py-1"
                onPress={() => handlePress(algo.value)}
                textValue={algo.label}
              >
                <div className="font-medium text-sm">{algo.label}</div>
              </DropdownItem>
            ))}
          </DropdownSection>
        ) : null}

        {ecdsaAlgos.length > 0 ? (
          <DropdownSection title="ECDSA Algorithms" showDivider>
            {ecdsaAlgos.map((algo) => (
              <DropdownItem
                key={`ecdsa-${algo.value}`}
                className="py-1"
                onPress={() => handlePress(algo.value)}
                textValue={algo.label}
              >
                <div className="font-medium text-sm">{algo.label}</div>
              </DropdownItem>
            ))}
          </DropdownSection>
        ) : null}

        {eddsaAlgos.length > 0 ? (
          <DropdownSection title="EdDSA Algorithms" showDivider>
            {eddsaAlgos.map((algo) => (
              <DropdownItem
                key={`eddsa-${algo.value}`}
                className="py-1"
                onPress={() => handlePress(algo.value)}
                textValue={algo.label}
              >
                <div className="font-medium text-sm">{algo.label}</div>
              </DropdownItem>
            ))}
          </DropdownSection>
        ) : null}

        {hmacAlgos.length > 0 ? (
          <DropdownSection title="HMAC Algorithms">
            {hmacAlgos.map((algo) => (
              <DropdownItem
                key={`hmac-${algo.value}`}
                className="py-1"
                onPress={() => handlePress(algo.value)}
                textValue={algo.label}
              >
                <div className="font-medium text-sm">{algo.label}</div>
              </DropdownItem>
            ))}
          </DropdownSection>
        ) : null}

        {otherAlgos.length > 0 ? (
          <DropdownSection title="Other Algorithms">
            {otherAlgos.map((algo) => (
              <DropdownItem
                key={`other-${algo.value}`}
                className="py-1"
                onPress={() => handlePress(algo.value)}
                textValue={algo.label}
              >
                <div className="font-medium text-sm">{algo.label}</div>
              </DropdownItem>
            ))}
          </DropdownSection>
        ) : null}
      </DropdownMenu>
    </Dropdown>
  );
};

export default AlgorithmPicker;
