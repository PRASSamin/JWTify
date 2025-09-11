"use client";
import { Select, SelectItem } from "@heroui/react";
import { usePemStore, ecCurves, edCurves, ecdhCurves } from "../../store";

export function CurveOptions() {
  const {
    curve,
    actions: { setCurve },
    algorithm,
  } = usePemStore();

  const curves = algorithm.startsWith("ES")
    ? ecCurves
    : algorithm.startsWith("Ed")
      ? edCurves
      : ecdhCurves;

  return (
    <Select
      label="Curve"
      selectedKeys={[curve]}
      variant="bordered"
      isDisabled={algorithm.startsWith("ES")}
      classNames={{
        trigger: "!border-border/75 border-1 bg-muted/30",
      }}
      onChange={(e) => setCurve(e.target.value)}
    >
      {curves.map((c) => (
        <SelectItem key={c} onPress={() => setCurve(c)}>
          {c}
        </SelectItem>
      ))}
    </Select>
  );
}
