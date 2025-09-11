import { Button, Tab, Tabs, Textarea } from "@heroui/react";
import { JsonEditor } from "@/components/JsonEditor";
import { cn } from "@/lib/utils";
import { PasteButton } from "@/components/PasteButton";
import { useEncoderStore } from "../store";
import { ImportButton } from "@/app/tool/jwt-encoder/components/ImportButton";
import { Clean } from "@/components/icons/Clean";

const KeyTab = () => {
  const { algorithm, key, keyType, actions } = useEncoderStore();
  const { setKey, setKeyType, clearImportedKey } = actions;

  const isSymmetric = algorithm.startsWith("HS");
  return (
    <Tabs
      onSelectionChange={(id) => setKeyType(id as "pem" | "jwk")}
      selectedKey={keyType}
      disabledKeys={[isSymmetric ? "pem" : "secret"]}
      classNames={{
        tabList: "border-border/75 border-1 bg-muted/30",
        panel: "pb-0 px-0",
      }}
    >
      {[
        {
          id: "secret",
          label: "Secret",
          content: (
            <Textarea
              label={"Secret Key"}
              minRows={8}
              maxRows={8}
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
              }}
              variant="bordered"
              classNames={{
                label: "select-none !text-default-600 !scale-85",
                inputWrapper: "!border-border/75 border-1 bg-muted/30",
              }}
            />
          ),
        },
        {
          id: "pem",
          label: "PEM",
          content: (
            <Textarea
              label={"Private Key"}
              minRows={8}
              maxRows={8}
              value={key}
              autoCorrect="off"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
              onChange={(e) => {
                setKey(e.target.value);
              }}
              variant="bordered"
              classNames={{
                label: "select-none !text-default-600 !scale-85",
                inputWrapper: "!border-border/75 border-1 bg-muted/30",
              }}
            />
          ),
        },
        {
          id: "jwk",
          label: "JWK",
          content: (
            <JsonEditor
              label={isSymmetric ? "Shared JWK" : "Private JWK"}
              className="[&_.monaco-editor]:min-h-[calc(200px-38px)]"
              wrapperClassName="rounded-medium min-h-[200px]"
              value={key}
              onChange={(val) => setKey(val || "")}
            />
          ),
        },
        {
          id: "paste",
          label: (
            <PasteButton
              onPaste={(text) => {
                setKey(text);
              }}
              className="px-2"
            />
          ),
          tabClassName: "p-0",
          content: null,
        },
        {
          id: "clean",
          label: (
            <Button
              size="sm"
              variant="light"
              onPress={clearImportedKey}
              className="!bg-transparent aspect-square p-0 min-w-auto relative overflow-hidden px-2"
            >
              <Clean size={16} className="m-auto text-muted-foreground" />
            </Button>
          ),
          tabClassName: "p-0",
          content: null,
        },
        {
          id: "import",
          label: <ImportButton className="px-2" />,
          tabClassName: "p-0",
          content: null,
        },
      ].map((item) => (
        <Tab
          key={item.id}
          title={item.label}
          className={cn("[&>div]:flex", item?.tabClassName)}
        >
          {item.content}
        </Tab>
      ))}
    </Tabs>
  );
};

export default KeyTab;
