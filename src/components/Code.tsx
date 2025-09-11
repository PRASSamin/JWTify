import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "./CopyButton";
import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import { cn } from "@/lib/utils";

interface Props extends React.ComponentProps<typeof Card> {
  label: string;
  code: string;
  lang?: string;
}

export const CodeBlock = ({
  label,
  code,
  lang = "json",
  className,
  ...props
}: Props) => {
  const [highlightedCode, setHighlightedCode] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    (async () => {
      if (!code) {
        setHighlightedCode("");
        return;
      }

      try {
        const html = await codeToHtml(code, {
          lang,
          theme: "aurora-x",
        });

        if (isMounted) setHighlightedCode(html);
      } catch (err) {
        console.error("Shiki highlight failed:", err);
        // fallback to raw preformatted code
        setHighlightedCode(`<pre><code>${escapeHtml(code)}</code></pre>`);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [code, lang]);

  return (
    <Card
      className={cn(
        "py-0 border-border/75 gap-0 bg-card/50 backdrop-blur-lg",
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="!py-2 px-3 uppercase text-xs border-b border-border/75 flex justify-between items-center select-none">
        <span className="font-medium text-muted-foreground">{label}</span>
        <CopyButton text={code} />
      </div>

      {/* Highlighted Code */}
      <CardContent
        className="p-5 text-sm [&>pre]:whitespace-pre-wrap [&>pre]:break-all [&>pre]:!bg-transparent rounded-md min-h-[220px] overflow-auto scrollbar-auto"
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
    </Card>
  );
};

const escapeHtml = (str: string) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
