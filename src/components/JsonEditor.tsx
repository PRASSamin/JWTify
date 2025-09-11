import React from "react";
import Editor, { EditorProps } from "@monaco-editor/react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { PasteButton } from "./PasteButton";

interface JsonEditorProps extends EditorProps {
  label?: string;
  onPaste?: (text: string) => void;
  wrapperClassName?: string;
}

export const JsonEditor: React.FC<Omit<JsonEditorProps, "defaultLanguage">> = ({
  label,
  className,
  theme,
  loading,
  options,
  onPaste,
  wrapperClassName,
  ...props
}) => {
  return (
    <>
      <style>{`
        .monaco-editor{
          --vscode-focusBorder: transparent !important;
        }
      `}</style>
      <div
        className={cn(
          "bg-muted/30 rounded-2xl border-1 border-border/75 pt-9 relative group",
          wrapperClassName
        )}
      >
        {label ? (
          <label className="absolute top-2 left-6 z-10 origin-top-left shrink-0 subpixel-antialiased cursor-text will-change-auto motion-reduce:transition-none transition-[transform,color,left,opacity,translate,scale] text-default-600 pointer-events-auto scale-85 text-small pb-0.5 pe-2 max-w-full text-ellipsis overflow-hidden select-none">
            {label}
          </label>
        ) : null}
        <Editor
          defaultLanguage="json"
          className={cn(
            "[&_.monaco-editor-background]:!bg-transparent [&_.decorationsOverviewRuler]:!hidden [&_.monaco-editor]:!bg-transparent [&_.presentations]:!hidden [&_.margin-view-overlays]:!bg-transparent [&_.scrollbar]:!hidden [&_.current-line-exact]:!border-0 [&_.margin]:!bg-transparent",
            className
          )}
          theme={theme || "vs-dark"}
          loading={
            loading || (
              <Loader2
                size={20}
                className="text-muted-foreground animate-spin"
              />
            )
          }
          options={{
            lineNumbers: "off",
            minimap: {
              enabled: false,
            },
            ...options,
          }}
          {...props}
        />
        {onPaste && (
          <PasteButton
            onPaste={onPaste}
            className="absolute top-2 right-2 z-10"
          />
        )}
      </div>
    </>
  );
};
