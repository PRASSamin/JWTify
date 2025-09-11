import { ImageZoom } from "./ImageZoom";
import { Link } from "./Link";
import { JWT_FLOW } from "@/constants/images";

const JwtDoc = () => {
  return (
    <section className="my-12">
      <h2 className="text-2xl font-bold mb-6 border-b border-border/75 pb-2">
        What is JSON Web Token (JWT)?
      </h2>
      <p className="mb-8 leading-relaxed text-foreground/80">
        <strong>JSON Web Token (JWT)</strong> is an open standard (
        <Link variant="fuma" href={"https://tools.ietf.org/html/rfc7519"}>
          RFC 7519
        </Link>
        ) that defines a compact and self-contained way for securely
        transmitting information between parties as a JSON object. JWTs are
        commonly used for authentication and information exchange in web
        applications.
      </p>
      <h2 className="text-2xl font-bold mb-6 mt-12 border-b border-border/75 pb-2">
        Structure of JWT
      </h2>
      <p className="mb-8 leading-relaxed text-foreground/80">
        A JWT consists of three parts separated by periods (.), which are
        base64url-encoded strings:
      </p>
      <ImageZoom
        src={"/images/jwt-structure.svg"}
        alt="jwt structure"
        width={500}
        height={500}
        className="w-full rounded-lg max-w-3xl justify-self-center"
      />
      <ul className="list-disc pl-6 mb-6 mt-8 leading-relaxed space-y-1 [&>li]:text-foreground/80 [&>li_strong]:text-foreground">
        <li>
          <strong>Header:</strong> The header typically consists of two parts:
          the type of the token, which is JWT, and the signing algorithm being
          used, such as HMAC SHA256 or RSA.
        </li>
        <li>
          <strong>Payload:</strong> The second part of the token is the payload,
          which contains the claims. Claims are statements about an entity
          (typically, the user) and additional data. There are three types of
          claims: registered, public, and private claims.
        </li>
        <li>
          <strong>Signature:</strong> To create the signature part, you need to
          take the encoded header, encoded payload, a secret, and the algorithm
          specified in the header, then sign that with the secret. The signature
          is used to verify that the sender of the JWT is who it says it is and
          to ensure that the message wasn’t changed along the way.
        </li>
      </ul>

      <h2 className="text-2xl font-bold mb-6 mt-12 border-b border-border/75 pb-2">
        How JWT work
      </h2>
      <p className="mb-8 leading-relaxed text-foreground/80">
        When a user logs in or attempts to access a protected resource, the
        server generates a JWT after successful authentication. The client then
        stores this token, usually in local storage or a cookie. For every
        subsequent request that requires authentication, the client sends the
        JWT in the request headers. The server validates the token by checking
        the signature and decoding the payload to ensure the user’s authenticity
        and authorization.
      </p>

      <ImageZoom
        src={JWT_FLOW}
        alt="JWT Flow"
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

export default JwtDoc;
