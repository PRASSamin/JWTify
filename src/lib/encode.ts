import * as jose from "jose";
import { secp256k1 } from "@noble/curves/secp256k1";
import { ed448 } from "@noble/curves/ed448";
import { sha256 } from "@noble/hashes/sha2.js";
import { importEdDSAPem, importSecp256k1Pem } from "./util-helpers";

interface EncodeJWTOptions {
  algo: string;
  key: string | object;
  payload: Record<string, unknown>;
  type?: "pem" | "jwk" | "secret";
}

// Extract private key from secp256k1 JWK
const jwkToSecp256k1PrivateKey = (jwk: jose.JWK): Uint8Array => {
  if (jwk.kty !== "EC" || jwk.crv !== "secp256k1") {
    throw new Error("JWK must be an EC key with secp256k1 curve");
  }

  if (!jwk.d) {
    throw new Error('JWK must contain private key component "d"');
  }

  return jose.base64url.decode(jwk.d);
};

// Extract private key from Ed448 JWK
const jwkToEd448PrivateKey = (jwk: jose.JWK): Uint8Array => {
  if (jwk.kty !== "OKP" || jwk.crv !== "Ed448") {
    throw new Error("JWK must be an OKP key with Ed448 curve");
  }

  if (!jwk.d) {
    throw new Error('JWK must contain private key component "d"');
  }

  const privateKeyBytes = jose.base64url.decode(jwk.d);
  if (privateKeyBytes.length !== 57) {
    throw new Error("Ed448 private key must be 57 bytes");
  }

  return privateKeyBytes;
};

// Custom ES256K signing function
async function signES256K(
  data: Uint8Array,
  privateKeyBytes: Uint8Array
): Promise<Uint8Array> {
  // Hash the data with SHA-256
  const hash = sha256(data);

  // Sign with secp256k1
  const signature = secp256k1.sign(hash, privateKeyBytes, {
    format: "compact",
  });

  return signature;
}

// Custom Ed448 signing function
async function signEd448(
  data: Uint8Array,
  privateKeyBytes: Uint8Array
): Promise<Uint8Array> {
  // Ed448 signs the raw data directly (no hashing needed)
  const signature = ed448.sign(data, privateKeyBytes);

  // Return the signature bytes (114 bytes for Ed448)
  return signature;
}

export async function encodeJWT({
  algo,
  key,
  payload,
  type,
}: EncodeJWTOptions): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // --- Header & Payload ---
  const jwtPayload = {
    iat: now,
    ...payload,
  };

  const te = new TextEncoder();

  // --- Handle ES256K specifically ---
  if (algo === "ES256K") {
    // Create header and payload
    const header = { alg: "ES256K", typ: "JWT" };
    const encodedHeader = jose.base64url.encode(
      te.encode(JSON.stringify(header))
    );
    const encodedPayload = jose.base64url.encode(
      te.encode(JSON.stringify(jwtPayload))
    );

    // Create signing input
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const signingData = te.encode(signingInput);

    // Extract private key bytes based on key type
    let privateKeyBytes: Uint8Array;

    if (typeof key === "object" || type === "jwk") {
      privateKeyBytes = jwkToSecp256k1PrivateKey(key as jose.JWK);
    } else if (typeof key === "string") {
      if (key.includes("-----BEGIN")) {
        // PEM format
        privateKeyBytes = importSecp256k1Pem(key);
      } else {
        // Assume it's a hex string
        privateKeyBytes = new Uint8Array(
          key.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
        );
      }
    } else {
      throw new Error("Invalid key format for ES256K");
    }

    // Sign the data
    const signature = await signES256K(signingData, privateKeyBytes);
    const encodedSignature = jose.base64url.encode(signature);

    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
  }

  // --- Handle Ed448 specifically ---
  if (algo === "Ed448") {
    // Create header and payload
    const header = { alg: "Ed448", typ: "JWT" };
    const encodedHeader = jose.base64url.encode(
      te.encode(JSON.stringify(header))
    );
    const encodedPayload = jose.base64url.encode(
      te.encode(JSON.stringify(jwtPayload))
    );

    // Create signing input
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const signingData = te.encode(signingInput);

    // Extract private key bytes based on key type
    let privateKeyBytes: Uint8Array;

    if (typeof key === "object" || type === "jwk") {
      privateKeyBytes = jwkToEd448PrivateKey(key as jose.JWK);
    } else if (typeof key === "string") {
      if (key.includes("-----BEGIN")) {
        // PEM format
        privateKeyBytes = importEdDSAPem(key, 57); // Ed448 private key is 57 bytes
      } else {
        // Assume it's a hex string (114 hex chars = 57 bytes)
        if (key.length !== 114) {
          throw new Error(
            "Ed448 private key must be 57 bytes (114 hex characters)"
          );
        }
        privateKeyBytes = new Uint8Array(
          key.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
        );
      }
    } else {
      throw new Error("Invalid key format for Ed448");
    }

    // Validate key length
    if (privateKeyBytes.length !== 57) {
      throw new Error("Ed448 private key must be exactly 57 bytes");
    }

    // Sign the data
    const signature = await signEd448(signingData, privateKeyBytes);
    const encodedSignature = jose.base64url.encode(signature);

    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
  }

  // --- NONE algorithm ---
  if (algo === "none") {
    const header = jose.base64url.encode(
      te.encode(JSON.stringify({ alg: "none", typ: "JWT" }))
    );
    const body = jose.base64url.encode(te.encode(JSON.stringify(jwtPayload)));
    return `${header}.${body}.`;
  }

  let secretOrKey;

  // --- Key Import for standard algorithms ---
  if (algo.startsWith("HS")) {
    // HMAC → use raw secret
    secretOrKey =
      typeof key === "string"
        ? new TextEncoder().encode(key)
        : (key as Uint8Array);
  } else if (typeof key === "object" || type === "jwk") {
    // JWK
    secretOrKey = await jose.importJWK(key as jose.JWK, algo);
  } else {
    // PEM/PKCS8
    if (
      algo.startsWith("RS") ||
      algo.startsWith("PS") ||
      algo.startsWith("ES") ||
      algo.startsWith("Ed")
    ) {
      secretOrKey = await jose.importPKCS8(key as string, algo);
    } else {
      throw new Error(`Unsupported PEM key for algo ${algo}`);
    }
  }

  // --- Sign JWT with JOSE ---
  return await new jose.SignJWT(jwtPayload)
    .setProtectedHeader({ alg: algo, typ: "JWT" })
    .sign(secretOrKey);
}
