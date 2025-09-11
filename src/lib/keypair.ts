import * as jose from "jose";
import { ed25519 } from "@noble/curves/ed25519";
import { ed448 } from "@noble/curves/ed448";
import { x25519 } from "@noble/curves/ed25519";
import { x448 } from "@noble/curves/ed448";
import { secp256k1 } from "@noble/curves/secp256k1";
import * as asn1js from "asn1js";
import * as pkijs from "pkijs";
import { v4 as uuidv4 } from "uuid";
import { JwkOptions } from "../types";
import { JwkKeyOpsHelper } from "./jwk";
import forge from "node-forge";

// ==================================
// HELPERS START
// ==================================
export function pkcs8ToPkcs1(pkcs8Buffer: ArrayBuffer): ArrayBuffer {
  const asn1 = asn1js.fromBER(pkcs8Buffer);
  if (asn1.offset === -1) {
    throw new Error("Invalid PKCS#8 input");
  }

  const pkcs8 = new pkijs.PrivateKeyInfo({ schema: asn1.result });

  // This is the raw PKCS#1 inside
  const pkcs1View = new Uint8Array(pkcs8.privateKey.valueBlock.valueHex);

  // Return a clean ArrayBuffer copy
  return pkcs1View.buffer.slice(
    pkcs1View.byteOffset,
    pkcs1View.byteOffset + pkcs1View.byteLength
  );
}

/**
 * Convert PEM string -> DER (Uint8Array).
 * - Supports: "RSA PRIVATE KEY", "EC PRIVATE KEY", "PRIVATE KEY" (PKCS#8), "PUBLIC KEY", "CERTIFICATE",
 *   "OPENSSH PRIVATE KEY", and legacy encrypted RSA PEM (Proc-Type + DEK-Info).
 * - If the PEM is encrypted (legacy RSA), pass `options.passphrase`.
 *
 * Limitations:
 * - PKCS#8 EncryptedPrivateKeyInfo (BEGIN ENCRYPTED PRIVATE KEY) is NOT decrypted here.
 *   For that you can use pkijs/EncryptedPrivateKeyInfo with WebCrypto; I give notes below.
 *
 * @param pem PEM string (may include header/footer and PEM-style headers)
 * @param options.passphrase optional passphrase for legacy OpenSSL encrypted PEM (Proc-Type)
 * @returns {der: Uint8Array, type: string}
 */
export function pemToDer(
  pem: string,
  options?: { passphrase?: string }
): {
  der: Uint8Array;
  /**
   * detected type header, e.g. "RSA PRIVATE KEY", "PUBLIC KEY", "CERTIFICATE", "OPENSSH PRIVATE KEY"
   */
  type: string;
} {
  if (!pem || typeof pem !== "string") {
    throw new Error("pemToDer: pem must be a non-empty string");
  }

  // Normalize line endings
  const normalized = pem.replace(/\r\n/g, "\n").trim();

  // Extract the header/footer block(s). A PEM may contain multiple blocks; we'll operate on the first.
  const pemBlockMatch = normalized.match(
    /-----BEGIN ([A-Z0-9 \-]+)-----(?:\n([\s\S]*?)\n-----END \1-----)/
  );
  if (!pemBlockMatch) {
    throw new Error("pemToDer: no PEM header/footer found");
  }

  const type = pemBlockMatch[1].trim(); // e.g. "RSA PRIVATE KEY"
  let body = pemBlockMatch[2].trim();

  // If the PEM contains additional header lines (like "Proc-Type" or "DEK-Info"), extract them.
  // Some PEMs put header-like lines between BEGIN line and base64 content.
  // Try to detect and strip such header lines (they usually contain ":" or "Proc-Type")
  const headerLines: string[] = [];
  const possibleBodyLines = body.split("\n");
  let base64LinesStart = 0;
  for (let i = 0; i < possibleBodyLines.length; i++) {
    const line = possibleBodyLines[i].trim();
    // typical base64 lines are long and do not contain ":"; header lines often contain ":" or "Proc-Type"
    if (
      line.includes(":") ||
      line.toUpperCase().startsWith("DEK-INFO") ||
      line.toUpperCase().startsWith("PROC-TYPE")
    ) {
      headerLines.push(line);
      continue;
    }
    // first line that is base64-looking (letters + / + + + =)
    if (/^[A-Za-z0-9+/=]+$/.test(line)) {
      base64LinesStart = i;
      break;
    }
    // otherwise if line is empty continue
  }

  if (headerLines.length > 0) {
    body = possibleBodyLines.slice(base64LinesStart).join("\n").trim();
  }

  // Helper: base64 -> Uint8Array
  const base64ToUint8 = (b64: string) => {
    // atob is available in browsers; fallback for Node: Buffer
    if (typeof window !== "undefined" && typeof window.atob === "function") {
      const binary = atob(b64.replace(/\s+/g, ""));
      const len = binary.length;
      const out = new Uint8Array(len);
      for (let i = 0; i < len; i++) out[i] = binary.charCodeAt(i);
      return out;
    } else {
      // Node.js
      const buf = Buffer.from(b64.replace(/\s+/g, ""), "base64");
      return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    }
  };

  // Special-case: legacy OpenSSL encrypted RSA PEM (Proc-Type + DEK-Info)
  const isLegacyEncryptedRSA =
    /RSA PRIVATE KEY/i.test(type) &&
    headerLines.some(
      (l) =>
        l.toUpperCase().includes("DEK-INFO") ||
        l.toUpperCase().includes("PROC-TYPE")
    );

  if (isLegacyEncryptedRSA) {
    const pass = options?.passphrase;
    if (!pass) {
      throw new Error(
        "pemToDer: detected legacy encrypted RSA PEM (Proc-Type / DEK-Info). Please provide options.passphrase to decrypt."
      );
    }
    // Try to use node-forge to decrypt (works for traditional PEM encryption)
    try {
      // node-forge expects the full PEM including the header lines; rebuild minimal PEM
      const fullPem = `-----BEGIN ${type}-----\n${headerLines.join("\n")}\n\n${body}\n-----END ${type}-----`;
      const priv = forge.pki.decryptRsaPrivateKey(fullPem, pass);
      if (!priv) {
        throw new Error(
          "forge failed to decrypt legacy RSA PEM with provided passphrase"
        );
      }
      // Convert forge privateKey -> ASN.1 -> DER bytes
      const asn1 = forge.pki.privateKeyToAsn1(priv); // PKCS#1 RSAPrivateKey
      const derForge = forge.asn1.toDer(asn1).getBytes();
      const out = new Uint8Array(derForge.length);
      for (let i = 0; i < derForge.length; i++) out[i] = derForge.charCodeAt(i);
      return { der: out, type };
    } catch (err: any) {
      throw new Error(
        `pemToDer: failed to decrypt legacy RSA PEM: ${String(err?.message ?? err)}`
      );
    }
  }

  // For all other types (including RSA PRIVATE KEY unencrypted, EC PRIVATE KEY, PRIVATE KEY (PKCS#8),
  // PUBLIC KEY, CERTIFICATE, OPENSSH PRIVATE KEY), the body is typically base64 content.
  // For OpenSSH private key the base64 decodes to a binary blob too.
  try {
    const der = base64ToUint8(body);
    return { der, type };
  } catch (err: any) {
    throw new Error(
      `pemToDer: base64 decode failed: ${String(err?.message ?? err)}`
    );
  }
}

// Convert ArrayBuffer to PEM string
export const toPEM = (
  keyData: ArrayBuffer,
  type: "PRIVATE" | "PUBLIC" | "RSA PRIVATE" | "ENCRYPTED PRIVATE"
) => {
  const b64 = Buffer.from(keyData).toString("base64");
  const formatted = b64.match(/.{1,64}/g)?.join("\n");
  return `-----BEGIN ${type} KEY-----\n${formatted}\n-----END ${type} KEY-----`;
};

const okpPublicToPem = (pub: Uint8Array, curve: string) => {
  // RFC 8410: Ed25519 / X25519 Public Key = SubjectPublicKeyInfo
  let header: string;
  if (curve === "Ed25519") header = "302a300506032b6570032100";
  else if (curve === "Ed448") header = "3041300506032b657b033900";
  else if (curve === "X25519") header = "302a300506032b656e032100";
  else if (curve === "X448") header = "3041300506032b656f033900";
  else throw new Error(`Unsupported curve: ${curve}`);

  const der = Buffer.concat([Buffer.from(header, "hex"), Buffer.from(pub)]);
  return toPEM(
    der.buffer.slice(der.byteOffset, der.byteOffset + der.byteLength),
    "PUBLIC"
  );
};

const okpPrivateToPem = (priv: Uint8Array, curve: string) => {
  // RFC 8410: PKCS#8 PrivateKeyInfo
  let header: string;
  if (curve === "Ed25519") header = "302e020100300506032b657004220420";
  else if (curve === "Ed448") header = "3046020100300506032b657b04210420";
  else if (curve === "X25519") header = "302e020100300506032b656e04220420";
  else if (curve === "X448") header = "3047020100300506032b656f043a0438";
  else throw new Error(`Unsupported curve: ${curve}`);
  const der = Buffer.concat([Buffer.from(header, "hex"), Buffer.from(priv)]);

  return toPEM(
    der.buffer.slice(der.byteOffset, der.byteOffset + der.byteLength),
    "PRIVATE"
  );
};

/**
 * Check if an algorithm is symmetric (OCT key)
 */
export const isOCTAlgo = (alg: string): boolean => {
  const octAlgos = [
    // HMAC
    "HS256",
    "HS384",
    "HS512",
    // AES Key Wrap
    "A128KW",
    "A192KW",
    "A256KW",
    // AES GCM Key Wrap
    "A128GCMKW",
    "A192GCMKW",
    "A256GCMKW",
    // AES GCM Content Encryption
    "A128GCM",
    "A192GCM",
    "A256GCM",
  ];

  return octAlgos.includes(alg.toUpperCase());
};

// ==================================
// HELPERS END
// ==================================

// ==================================
// GENERATORS START
// ==================================

/**
 * HMAC (HS256, HS384, HS512)
 */
export const generateHMAC = async (algorithm: string, size?: number) => {
  const keyData = crypto.getRandomValues(new Uint8Array(size || 32));
  const secret = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: `SHA-${algorithm.slice(2)}` },
    true,
    ["sign", "verify"]
  );
  const jwk = await jose.exportJWK(secret);
  const raw = await window.crypto.subtle.exportKey("raw", secret);
  const rawHex = Array.from(new Uint8Array(raw))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return { jwk, secret: rawHex };
};

/**
 * AES Key Wrap (A128KW, A192KW, A256KW)
 * AES GCM Key Wrap (A128GCMKW, A192GCMKW, A256GCMKW)
 * AES GCM Content Encryption (A128GCM, A192GCM, A256GCM)
 */
export const generateAES = async (
  algorithm: "AES-KW" | "AES-GCM" | "AES-GCMKW",
  size?: number
) => {
  const keyData = crypto.getRandomValues(new Uint8Array(size || 32));

  const secret = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: algorithm === "AES-KW" ? "AES-KW" : "AES-GCM" },
    true,
    algorithm === "AES-GCM" ? ["encrypt", "decrypt"] : ["wrapKey", "unwrapKey"]
  );

  const jwk = await jose.exportJWK(secret);
  return { jwk };
};

export const generateOCT = async (
  algorithm: string,
  options: {
    octSizeBytes?: number;
  } & JwkOptions = {}
) => {
  const { octSizeBytes, use, kid, key_ops } = options;
  let jwk: jose.JWK;
  let defaultUse: string = "sig";
  let defaultKeyOps: string[] = [];
  const defaultKid = uuidv4();

  switch (algorithm) {
    case "HS256":
    case "HS384":
    case "HS512":
      jwk = (await generateHMAC(algorithm, octSizeBytes)).jwk;
      defaultUse = "sig";
      defaultKeyOps = ["sign", "verify"];
      break;
    case "A128KW":
    case "A192KW":
    case "A256KW":
      jwk = (await generateAES("AES-KW", octSizeBytes)).jwk;
      defaultUse = "enc";
      defaultKeyOps = ["wrapKey", "unwrapKey"];
      break;
    case "A128GCMKW":
    case "A192GCMKW":
    case "A256GCMKW":
      jwk = (await generateAES("AES-GCMKW", octSizeBytes)).jwk;
      defaultUse = "enc";
      defaultKeyOps = ["wrapKey", "unwrapKey"];
      break;
    case "A128GCM":
    case "A192GCM":
    case "A256GCM":
      jwk = (await generateAES("AES-GCM", octSizeBytes)).jwk;
      defaultUse = "enc";
      defaultKeyOps = ["encrypt", "decrypt"];
      break;
    default:
      throw new Error(`Unsupported algorithm: ${algorithm}`);
  }

  const opsHelper = new JwkKeyOpsHelper(algorithm, key_ops || defaultKeyOps);
  const finalKeyOps = [
    ...opsHelper.getPublicOps(),
    ...opsHelper.getPrivateOps(),
  ];

  Object.assign(jwk, {
    alg: algorithm,
    use: use || defaultUse,
    key_ops: finalKeyOps,
    kid: kid || defaultKid,
  });

  return { jwk };
};

export const generateRsaOaep = async (
  algorithm: string,
  options: {
    keySize?: number;
    pkcsVersion?: 1 | 8;
  } & JwkOptions = {}
) => {
  const { keySize, pkcsVersion, use, key_ops, kid } = options;
  const hashSize = algorithm.includes("256")
    ? "SHA-256"
    : algorithm.includes("384")
      ? "SHA-384"
      : algorithm.includes("512")
        ? "SHA-512"
        : "SHA-1"; // legacy fallback, usually avoid

  const pair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: keySize || 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: { name: hashSize },
    },
    true,
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
  );

  // Export JWKs
  const publicJwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  const privateJwk = await crypto.subtle.exportKey("jwk", pair.privateKey);

  const defaultUse = "enc";
  const defaultKid = uuidv4();
  const defaultKeyOps = ["encrypt", "wrapKey", "decrypt", "unwrapKey"];
  const opsHelper = new JwkKeyOpsHelper(algorithm, key_ops || defaultKeyOps);

  Object.assign(publicJwk, {
    alg: algorithm,
    use: use || defaultUse,
    key_ops: opsHelper.getPublicOps(),
    kid: kid || defaultKid,
  });

  Object.assign(privateJwk, {
    alg: algorithm,
    use: use || defaultUse,
    key_ops: opsHelper.getPrivateOps(),
    kid: kid || defaultKid,
  });

  // Export PEMs
  const publicDer = await crypto.subtle.exportKey("spki", pair.publicKey);
  const pkcs8 = await crypto.subtle.exportKey("pkcs8", pair.privateKey);

  const publicPem = toPEM(publicDer, "PUBLIC");
  let privateDer: ArrayBuffer;
  if (pkcsVersion === 1) {
    // Convert PKCS8 → PKCS1
    privateDer = pkcs8ToPkcs1(pkcs8);
  } else {
    privateDer = pkcs8;
  }

  const privatePem = toPEM(
    privateDer,
    pkcsVersion === 1 ? "RSA PRIVATE" : "PRIVATE"
  );
  return {
    publicJwk,
    privateJwk,
    publicPem,
    privatePem,
    publicDer,
    privateDer,
  };
};

export const generateOKP = async (
  algorithm:
    | "EdDSA"
    | "ECDH-ES"
    | "ECDH-ES+A128KW"
    | "ECDH-ES+A192KW"
    | "ECDH-ES+A256KW",
  options: {
    curve?: string;
  } & JwkOptions = {}
) => {
  const { curve, use, key_ops, kid } = options;
  if (!curve) throw new Error("Curve is required for OKP");

  const supportedCurves = ["Ed25519", "Ed448", "X25519", "X448"];
  if (!supportedCurves.includes(curve)) {
    throw new Error(
      `Unsupported curve: ${curve}. Supported curves are: ${supportedCurves.join(
        ", "
      )}`
    );
  }

  let x, d;
  let pubBytes: Uint8Array;
  let privBytes: Uint8Array;
  let defaultUse: string;
  let defaultKeyOps: string[];

  if (curve === "Ed25519") {
    privBytes = ed25519.utils.randomSecretKey();
    pubBytes = ed25519.getPublicKey(privBytes);
    x = jose.base64url.encode(pubBytes);
    d = jose.base64url.encode(privBytes);
    defaultUse = "sig";
    defaultKeyOps = ["sign", "verify"];
  } else if (curve === "Ed448") {
    privBytes = ed448.utils.randomSecretKey();
    pubBytes = ed448.getPublicKey(privBytes);
    x = jose.base64url.encode(pubBytes);
    d = jose.base64url.encode(privBytes);
    defaultUse = "sig";
    defaultKeyOps = ["sign", "verify"];
  } else if (curve === "X25519") {
    privBytes = x25519.utils.randomSecretKey();
    pubBytes = x25519.getPublicKey(privBytes);
    x = jose.base64url.encode(pubBytes);
    d = jose.base64url.encode(privBytes);
    defaultUse = "enc";
    defaultKeyOps = ["deriveKey", "deriveBits"];
  } else if (curve === "X448") {
    privBytes = x448.utils.randomSecretKey();
    pubBytes = x448.getPublicKey(privBytes);
    x = jose.base64url.encode(pubBytes);
    d = jose.base64url.encode(privBytes);
    defaultUse = "enc";
    defaultKeyOps = ["deriveKey", "deriveBits"];
  } else {
    throw new Error("Should not happen");
  }

  const opsHelper = new JwkKeyOpsHelper(algorithm, key_ops || defaultKeyOps);

  const defaultKid = uuidv4();

  const publicJwk: jose.JWK = {
    kty: "OKP",
    crv: curve,
    x: x!,
    alg: algorithm,
    use: use || defaultUse,
    key_ops: opsHelper.getPublicOps(),
    kid: kid || defaultKid,
  };
  const privateJwk: jose.JWK = {
    kty: "OKP",
    crv: curve,
    d: d!,
    x: x!,
    alg: algorithm,
    use: use || defaultUse,
    key_ops: opsHelper.getPrivateOps(),
    kid: kid || defaultKid,
  };

  // RFC 8410 PEM
  const publicPem = okpPublicToPem(pubBytes!, curve);
  const privatePem = okpPrivateToPem(privBytes!, curve);

  const publicDer = pemToDer(publicPem).der;
  const privateDer = pemToDer(privatePem).der;

  return {
    publicJwk,
    privateJwk,
    publicPem,
    privatePem,
    publicDer,
    privateDer,
  };
};

export const generateECDSA = async (
  algorithm: string,
  options: {
    curve?: "P-256" | "P-384" | "P-521" | "secp256k1";
  } & JwkOptions = {}
) => {
  const { curve, use, key_ops, kid } = options;

  if (curve === "secp256k1") {
    return generateES256K(kid, use, key_ops);
  }
  const ecCurve =
    curve ||
    (algorithm === "ES256"
      ? "P-256"
      : algorithm === "ES384"
        ? "P-384"
        : "P-521");

  const pair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: ecCurve },
    true,
    ["sign", "verify"]
  );

  const publicJwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  const privateJwk = await crypto.subtle.exportKey("jwk", pair.privateKey);

  const defaultKid = kid || uuidv4();
  const opsHelper = new JwkKeyOpsHelper(
    algorithm,
    key_ops || ["sign", "verify"]
  );

  Object.assign(publicJwk, {
    alg: algorithm,
    use: use || "sig",
    key_ops: opsHelper.getPublicOps(),
    kid: defaultKid,
  });

  Object.assign(privateJwk, {
    alg: algorithm,
    use: use || "sig",
    key_ops: opsHelper.getPrivateOps(),
    kid: defaultKid,
  });

  const publicDer = await crypto.subtle.exportKey("spki", pair.publicKey);
  const privateDer = await crypto.subtle.exportKey("pkcs8", pair.privateKey);

  const publicPem = toPEM(publicDer, "PUBLIC");
  const privatePem = toPEM(privateDer, "PRIVATE");

  return {
    publicJwk,
    privateJwk,
    publicPem,
    privatePem,
    publicDer,
    privateDer,
  };
};

// ES256K
export const generateES256K = async (
  kid?: string,
  use?: string,
  key_ops?: string[]
) => {
  // Generate private key
  const privKey = secp256k1.utils.randomSecretKey();
  const pubKey = secp256k1.getPublicKey(privKey, false); // uncompressed (65 bytes)
  const opsHelper = new JwkKeyOpsHelper(
    "ES256K",
    key_ops || ["sign", "verify"]
  );

  const x = jose.base64url.encode(pubKey.slice(1, 33));
  const y = jose.base64url.encode(pubKey.slice(33, 65));

  const jwkBase = {
    kty: "EC",
    crv: "secp256k1",
    x,
    y,
    kid: kid || uuidv4(),
    use: use || "sig",
    alg: "ES256K",
  };

  const publicJwk = { ...jwkBase, key_ops: opsHelper.getPublicOps() };
  const privateJwk = {
    ...jwkBase,
    d: jose.base64url.encode(privKey),
    key_ops: opsHelper.getPrivateOps(),
  };

  // Export to PEM (via SPKI/PKCS8)
  // noble doesn’t directly give SPKI/PKCS8, so we encode manually
  // -> easiest is to use your existing `toPEM` helpers with DER headers
  const publicPem = toPEM(
    Buffer.concat([
      Buffer.from("3056301006072a8648ce3d020106052b8104000a034200", "hex"), // secp256k1 OID + header
      Buffer.from(pubKey),
    ]).buffer,
    "PUBLIC"
  );

  const privatePem = toPEM(
    Buffer.concat([
      Buffer.from("30740201010420", "hex"),
      Buffer.from(privKey),
      Buffer.from("a00706052b8104000aa144034200", "hex"), // secp256k1 OID + publicKey tag
      Buffer.from(pubKey),
    ]).buffer,
    "PRIVATE"
  );

  return {
    publicJwk,
    privateJwk,
    publicPem,
    privatePem,
    publicDer: pemToDer(publicPem).der,
    privateDer: pemToDer(privatePem).der,
  };
};

export const generateRSA = async (
  algorithm: string,
  options: {
    keySize?: number;
    pkcsVersion?: 1 | 8;
  } & JwkOptions = {}
) => {
  const { keySize = 2048, pkcsVersion = 1, use, key_ops, kid } = options;
  const hash = algorithm.slice(-3); // e.g. "256" in PS256
  const algName = algorithm.startsWith("PS") ? "RSA-PSS" : "RSASSA-PKCS1-v1_5";

  // Generate key pair
  const pair = await crypto.subtle.generateKey(
    {
      name: algName,
      modulusLength: keySize,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: `SHA-${hash}`,
    },
    true,
    ["sign", "verify"]
  );

  // Export public key (SPKI → PEM)
  const publicDer = await crypto.subtle.exportKey("spki", pair.publicKey);
  const publicPem = toPEM(publicDer, "PUBLIC");

  // Export private key in pkcs8 first
  const pkcs8 = await crypto.subtle.exportKey("pkcs8", pair.privateKey);

  let privateDer: ArrayBuffer;
  if (pkcsVersion === 1) {
    // Convert PKCS8 → PKCS1
    privateDer = pkcs8ToPkcs1(pkcs8);
  } else {
    privateDer = pkcs8;
  }

  const privatePem = toPEM(
    privateDer,
    pkcsVersion === 1 ? "RSA PRIVATE" : "PRIVATE"
  );

  // Export JWK too
  const publicJwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  const privateJwk = await crypto.subtle.exportKey("jwk", pair.privateKey);

  const defaultUse = "sig";
  const defaultKeyOps = ["sign", "verify"];
  const defaultKid = uuidv4();

  const opsHelper = new JwkKeyOpsHelper(algorithm, key_ops || defaultKeyOps);

  Object.assign(publicJwk, {
    alg: algorithm,
    use: use || defaultUse,
    key_ops: opsHelper.getPublicOps(),
    kid: kid || defaultKid,
  });

  Object.assign(privateJwk, {
    alg: algorithm,
    use: use || defaultUse,
    key_ops: opsHelper.getPrivateOps(),
    kid: kid || defaultKid,
  });

  return {
    publicJwk,
    privateJwk,
    publicPem,
    privatePem,
    publicDer,
    privateDer,
  };
};
