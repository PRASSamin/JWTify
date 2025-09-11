"use client";
import { Select, SelectItem } from "@heroui/react";
import { octSizes, useJwkStore } from "../../store";

export function OctOptions() {
  const {
    octSize,
    algorithm,
    actions: { setOctSize },
  } = useJwkStore();
  return (
    <Select
      label="Secret length"
      selectedKeys={[String(octSize)]}
      disabledKeys={!algorithm.startsWith("HS") ? ["48", "64"] : []}
      variant="bordered"
      classNames={{
        trigger: "!border-border/75 border-1 bg-muted/40",
      }}
      onChange={(e) => setOctSize(Number(e.target.value))}
    >
      {octSizes.map((size) => (
        <SelectItem
          key={`${size}`}
          onPress={() => setOctSize(size)}
        >
          {`${size} (${size * 8}-bit)`}
        </SelectItem>
      ))}
    </Select>
  );
}
