import { EXAMPLE_JWK, JWK_FLOW } from "@/constants/images";
import { ExternalLink } from "lucide-react";
import { Link } from "@/components/Link";
import { ImageZoom } from "@/components/ImageZoom";

const JwkDoc = () => {
  return (
    <section className="my-12">
      <h2 className="text-2xl font-bold mb-6 border-b border-border/75 pb-2">
        What is a JWK?
      </h2>
      <p className="mb-8 leading-relaxed text-foreground/80">
        <Link
          href="https://datatracker.ietf.org/doc/html/rfc7517"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-bold hover:text-primary"
        >
          JSON Web Key (JWK)
        </Link>{" "}
        are a JSON data structure that represents cryptographic keys. These keys
        are primarily used for verifying JWT in OAuth flows. JWK are designed to
        be easily exchanged, making them a standardized and interoperable format
        for representing cryptographic keys. Its structure depends on the{" "}
        <Link
          href="https://www.iana.org/assignments/jose/jose.xhtml#web-key-types"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-bold hover:text-primary"
        >
          key type (like RSA, EC, or OCT)
        </Link>
        , but most keys share some common fields that describe how the key
        should be used. Below is an example RSA public key in JWK format:
      </p>

      <ImageZoom
        src={EXAMPLE_JWK}
        alt="Example JWK"
        width={500}
        height={500}
        className="w-full rounded-lg max-w-3xl justify-self-center"
      />

      <p className="mt-8 mb-4 text-foreground/80 leading-relaxed">
        Let’s break down what each part of this JSON means:
      </p>

      <ul className="list-disc pl-6 mb-6 leading-relaxed space-y-1 [&>li]:text-foreground/80 [&>li_strong]:text-foreground">
        <li>
          <strong>alg:</strong> The algorithm intended to be used with the key.
        </li>
        <li>
          <strong>e:</strong> The RSA public exponent. Usually a small value
          like <code>AQAB</code> (base64url for 65537).
        </li>
        <li>
          <strong>kty:</strong> The key type. For example, <code>RSA</code>,{" "}
          <code>EC</code>, or <code>oct</code> (symmetric).
        </li>
        <li>
          <strong>kid:</strong> The key ID. A unique identifier that helps
          systems pick the right key when multiple are available.
        </li>
        <li>
          <strong>n:</strong> The RSA modulus. A big base64url string
          representing the public key material.
        </li>
        <Link
          href="https://datatracker.ietf.org/doc/html/rfc7517#section-4"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-muted-foreground underline hover:text-primary group"
        >
          See full spec
          <ExternalLink className="group-hover:ml-0.5 group-hover:-mt-0.5 transition-all duration-300 size-4" />
        </Link>
      </ul>

      <h2 className="text-2xl font-bold mb-6 mt-12 border-b border-border/75 pb-2">
        How JWKs work
      </h2>
      <p className="mb-8 leading-relaxed text-foreground/80">
        When a system issues a signed JWT, it includes a <code>kid</code>
        (key ID) in the token header. Clients or other servers can fetch the
        JWKS endpoint, find the matching <code>kid</code>, and use the
        associated public key to verify the signature. This allows secure key
        rotation and trust establishment without hardcoding keys.
      </p>

      <ImageZoom
        src={JWK_FLOW}
        alt="JWK Flow"
        width={500}
        height={500}
        className="w-full rounded-lg max-w-3xl justify-self-center"
      />

      <h2 className="text-2xl font-bold mb-6 mt-12 border-b border-border/75 pb-2">
        Try it yourself
      </h2>
      <p className="mb-6 leading-relaxed text-foreground/80">
        Use the generator above to create secure JWKs directly in your browser.
        No server side processing, everything happens on your device for maximum
        security. You can generate RSA, EC, EdDSA, or symmetric keys with
        desired customization and export them in JWK format.
      </p>
    </section>
  );
};

export default JwkDoc;
