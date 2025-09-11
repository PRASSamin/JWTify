import { useJwkStore } from "../store";
import { isOCTAlgo } from "@/lib/keypair";
import { CodeBlock } from "@/components/Code";

const JwkOutput = () => {
  const { jwkPrivate, jwkPublic, jwkSet, algorithm } = useJwkStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {jwkPrivate && (
        <CodeBlock
          label="Private JWK"
          code={JSON.stringify(jwkPrivate, null, 2)}
        />
      )}

      {jwkPublic && (
        <CodeBlock
          label={isOCTAlgo(algorithm) ? "Shared JWK" : "Public JWK"}
          code={JSON.stringify(jwkPublic, null, 2)}
        />
      )}

      {jwkSet && (
        <CodeBlock
          label={isOCTAlgo(algorithm) ? "Shared JWK Set" : "Public JWK Set"}
          code={JSON.stringify(jwkSet, null, 2)}
        />
      )}
    </div>
  );
};

export default JwkOutput;
