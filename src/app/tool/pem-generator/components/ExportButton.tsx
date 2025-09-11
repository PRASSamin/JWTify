"use client";

import JSZip from "jszip";
import { saveAs } from "file-saver";
import { usePemStore } from "../store";
import { addToast } from "@heroui/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { ChevronDown, Download } from "lucide-react";
import { NAME } from "@/constants";

export const ExportButton = () => {
  const { privateKey, publicKey, fullGeneration, algorithm } = usePemStore();

  const exportKeys = async (format: "pem" | "der" | "jwk" | "all") => {
    try {
      const zip = new JSZip();

      if (format === "pem" || format === "all") {
        if (!privateKey || !publicKey)
          throw new Error("No PEM keys to export.");
        zip.file("private.key", privateKey);
        zip.file("public.key", publicKey);
      }

      if (format === "der" || format === "all") {
        if (!fullGeneration?.privateDer || !fullGeneration?.publicDer)
          throw new Error("No DER keys to export.");
        zip.file("private.der", fullGeneration.privateDer);
        zip.file("public.der", fullGeneration.publicDer);
      }

      if (format === "jwk" || format === "all") {
        if (!fullGeneration?.privateJwk || !fullGeneration?.publicJwk)
          throw new Error("No JWK keys to export.");
        zip.file(
          "private.json",
          JSON.stringify(fullGeneration.privateJwk, null, 2)
        );
        zip.file(
          "public.json",
          JSON.stringify(fullGeneration.publicJwk, null, 2)
        );
      }

      const content = await zip.generateAsync({ type: "blob" });
      const suffix = format === "all" ? "fullpack" : format;
      const kid =
        fullGeneration?.publicJwk?.kid || fullGeneration?.privateJwk?.kid || "";
      saveAs(
        content,
        `${NAME.toLowerCase()}-${suffix}-${algorithm}-${kid}.zip`
      );
    } catch (error: any) {
      addToast({
        title: "Export failed",
        color: "danger",
        description: error.message || "Could not export keys.",
      });
    }
  };

  return (
    <div className="flex">
      {/* Export PEM */}
      <Button
        variant="flat"
        onPress={() => exportKeys("pem")}
        className="rounded-r-none border-1 border-default/70 data-[pressed=true]:scale-100 aria-expanded:scale-100 min-w-auto flex items-center gap-2"
      >
        <Download size={16} />
        Export
      </Button>

      <Dropdown>
        <DropdownTrigger>
          <Button
            variant="flat"
            className="rounded-l-none border-1 border-l-0 border-default/70 aspect-square px-0 data-[pressed=true]:scale-100 aria-expanded:scale-100 min-w-auto"
          >
            <ChevronDown className="size-5 text-muted-foreground" />
          </Button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="Export"
          disabledKeys={[
            ...(!fullGeneration?.privateDer || !fullGeneration?.publicDer
              ? ["der"]
              : []),
            ...(!fullGeneration?.privateJwk || !fullGeneration?.publicJwk
              ? ["jwk"]
              : []),
            ...(!privateKey || !publicKey ? ["pem"] : []),
          ]}
        >
          <DropdownItem key="der" onPress={() => exportKeys("der")}>
            Export as DER
          </DropdownItem>
          <DropdownItem key="jwk" onPress={() => exportKeys("jwk")}>
            Export as JWK
          </DropdownItem>
          <DropdownItem key="pem" onPress={() => exportKeys("pem")}>
            Export as PEM
          </DropdownItem>
          <DropdownItem key="all" onPress={() => exportKeys("all")}>
            Export Full Pack
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
