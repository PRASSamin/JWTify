import { PEM_STRUCTURE } from "@/constants/images";
import { Link } from "@/components/Link";
import { ImageZoom } from "@/components/ImageZoom";

const PemDoc = () => {
  return (
    <section className="my-12">
      <h2 className="text-2xl font-bold mb-6 border-b border-border/75 pb-2">
        What is PEM?
      </h2>
      <p className="mb-8 leading-relaxed text-foreground/80">
        <Link
          href="https://www.rfc-editor.org/rfc/rfc7468"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-bold hover:text-primary"
        >
          Privacy-Enhanced Mail (PEM)
        </Link>{" "}
        is a base64-encoded container format for storing and transmitting
        cryptographic keys, certificates, and other data. Though originally for
        email, it’s now a de facto standard for various security protocols like
        TLS/SSL. PEM files are easily readable by humans and can be opened in a
        simple text editor.
      </p>

      <p className="mt-8 mb-4 text-foreground/80 leading-relaxed">
        A PEM file is a text file that includes a header and footer that specify
        the type of data it contains. Here is an example of an RSA private key
        in PEM format:
      </p>

      <pre className="bg-muted/40 p-4 min-w-full sm:min-w-auto sm:max-w-2xl justify-self-center rounded-lg text-sm text-foreground/80 mt-8 overflow-x-auto">
        <code className="flex flex-col break-all whitespace-pre-wrap">
          <span className="flex">
            <span className="text-purple-400">-----BEGIN PRIVATE KEY-----</span>
          </span>
          <span className="flex flex-col">
            <span className="text-emerald-400">
              MIIEvgIBADANBgkqhgEAAfsdgADANBgkfnhdcafscoIBAQDc...
            </span>
            <span className="text-emerald-400">
              ... (base64 encoded data) ...
            </span>
          </span>
          <span className="flex">
            <span className="text-rose-400">-----END PRIVATE KEY-----</span>
          </span>
        </code>
      </pre>

      <p className="mb-4 text-foreground/80 leading-relaxed text-center mt-8 md:mt-14">
        Let’s break down the structure:
      </p>

      <ImageZoom
        src={PEM_STRUCTURE}
        alt="PEM Structure"
        width={500}
        height={500}
        className="w-full rounded-lg max-w-3xl justify-self-center"
      />

      <h2 className="text-2xl font-bold mb-6 mt-12 border-b border-border/75 pb-2">
        How PEM files are used
      </h2>
      <p className="mb-8 leading-relaxed text-foreground/80">
        PEM files are widely used in web servers for SSL/TLS certificates. A web
        server might be configured with a PEM file containing the server&apos;s
        private key and another with the public certificate chain. Browsers use
        the public certificate to verify the server&apos;s identity. PEM is also
        used for SSH keys, code signing, and more. The generator on this page
        creates a key pair: a private key (which you should keep secret) and a
        public key (which you can share).
      </p>

      <h2 className="text-2xl font-bold mb-6 mt-12 border-b border-border/75 pb-2">
        Try it yourself
      </h2>
      <p className="mb-8 leading-relaxed text-foreground/80">
        Use the generator above to create secure PEM-formatted key pairs
        directly in your browser. No server side processing, everything happens
        on your device for maximum security. You can generate RSA, EC, or EdDSA
        keys with desired customization and export them in PEM format.
      </p>
    </section>
  );
};

export default PemDoc;
