"use client";
import { Select, SelectItem } from "@heroui/react";
import { useJwkStore, rsaSizes } from "../../store";

export function RsaOptions() {
  const {
    keySize,
    actions: { setKeySize },
  } = useJwkStore();

  return (
    <Select
      label="Key Size"
      selectedKeys={[keySize.toString()]}
      variant="bordered"
      classNames={{
        trigger: "!border-border/75 border-1 bg-muted/40",
      }}
      onChange={(e) => setKeySize(Number(e.target.value))}
    >
      {rsaSizes.map((size) => (
        <SelectItem
          key={size.value}
          onPress={() => {
            setKeySize(size.value);
          }}
        >
          {size.label}
        </SelectItem>
      ))}
    </Select>
  );
}
