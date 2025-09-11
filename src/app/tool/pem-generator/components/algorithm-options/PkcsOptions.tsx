"use client";
import { Select, SelectItem } from "@heroui/react";
import { usePemStore, pkcsVersions } from "../../store";

export function PkcsOptions() {
  const {
    pkcsVersion,
    actions: { setPkcsVersion },
  } = usePemStore();

  return (
    <Select
      label="PKCS Version"
      selectedKeys={[pkcsVersion.toString()]}
      variant="bordered"
      classNames={{
        trigger: "!border-border/75 border-1 bg-muted/30",
      }}
      onChange={(e) => setPkcsVersion(Number(e.target.value) as 1 | 8)}
    >
      {pkcsVersions.map((version) => (
        <SelectItem
          key={version.value}
          onPress={() => setPkcsVersion(version.value as 1 | 8)}
        >
          {version.label}
        </SelectItem>
      ))}
    </Select>
  );
}
