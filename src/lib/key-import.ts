import { generateJwkPair } from "@/lib/jwk";
import { generatePemPair } from "@/lib/pem";
import { v4 as uuidv4 } from "uuid";
import { generateHMAC } from "./keypair";

export interface ImportedKey {
  privateKey: string | object;
  publicKey: string | object;
  keyType: "pem" | "jwk" | "secret";
  algorithm: string;
}

export interface KeyImportOptions {
  algorithm: string;
  keyType: "pem" | "jwk" | "secret";
}

// Simplified key generation with minimal customization
export async function importSimplifiedKey(
  options: KeyImportOptions
): Promise<ImportedKey> {
  const { algorithm, keyType } = options;
  const algo = algorithm.startsWith("Ed") ? "EdDSA" : algorithm;

  if (keyType === "jwk") {
    // Generate JWK with default settings
    const keySize = 2048;
    let curve = "P-256";
    let octSize = 32;

    // Set defaults based on algorithm
    if (algo.startsWith("ES")) {
      const curveMap: Record<string, string> = {
        "256": "P-256",
        "384": "P-384",
        "512": "P-521",
        "256K": "secp256k1",
      };
      const ecdsaMatch = algo.match(/^ES(\d+|256K)$/);
      if (ecdsaMatch) {
        curve = curveMap[ecdsaMatch[1]];
      }
    } else if (algorithm.startsWith("Ed")) {
      curve = algorithm.endsWith("25519") ? "Ed25519" : "Ed448";
    } else if (algo.startsWith("HS")) {
      octSize = algo === "HS256" ? 32 : algo === "HS384" ? 48 : 64;
    }

    const { publicJwk, privateJwk } = await generateJwkPair({
      algorithm: algo,
      keySize,
      curve: curve as any,
      octSizeBytes: octSize,
      use: algo.startsWith("HS") ? "sig" : "sig",
      kid: uuidv4(),
      key_ops: ["sign", "verify"],
    });

    return {
      privateKey: algo.startsWith("HS") ? publicJwk : privateJwk,
      publicKey: publicJwk,
      keyType: "jwk",
      algorithm: algo.startsWith("Ed") ? curve : algo,
    };
  } else if (keyType === "secret") {
    if (algo.startsWith("HS")) {
      const { secret } = await generateHMAC(algo);
      return {
        privateKey: secret,
        publicKey: secret,
        keyType: "secret",
        algorithm: algo,
      };
    }
    throw new Error(`Unsupported algorithm for secret key type: ${algo}`);
  } else {
    // Generate PEM with default settings
    const keySize = 2048;
    let curve = "P-256";

    // Set defaults based on algorithm
    if (algo.startsWith("ES")) {
      const curveMap: Record<string, string> = {
        "256": "P-256",
        "384": "P-384",
        "512": "P-521",
        "256K": "secp256k1",
      };
      const ecdsaMatch = algo.match(/^ES(\d+|256K)$/);
      if (ecdsaMatch) {
        curve = curveMap[ecdsaMatch[1]];
      }
    } else if (algorithm.startsWith("Ed")) {
      curve = algorithm.endsWith("25519") ? "Ed25519" : "Ed448";
    }

    const response = await generatePemPair({
      algorithm: algo,
      keySize,
      curve: curve as any,
      pkcsVersion: 8,
    });

    return {
      privateKey: response.privateKey as string,
      publicKey: response.publicKey as string,
      keyType: "pem",
      algorithm: algo.startsWith("Ed") ? curve : algo,
    };
  }
}

// Get supported algorithms for import (subset of all algorithms)
export const IMPORT_ALGORITHMS = [
  // ---- RSA ----
  { label: "RS256 (RSA)", value: "RS256" },
  { label: "RS384 (RSA)", value: "RS384" },
  { label: "RS512 (RSA)", value: "RS512" },
  { label: "PS256 (RSA-PSS)", value: "PS256" },
  { label: "PS384 (RSA-PSS)", value: "PS384" },
  { label: "PS512 (RSA-PSS)", value: "PS512" },
  // ---- ECDSA ----
  { label: "ES256 (ECDSA P-256)", value: "ES256" },
  { label: "ES384 (ECDSA P-384)", value: "ES384" },
  { label: "ES512 (ECDSA P-521)", value: "ES512" },
  { label: "ES256K (ECDSA secp256k1)", value: "ES256K" },
  // ---- EdDSA ----
  { label: "Ed25519 (EdDSA)", value: "EdDSA25519" },
  { label: "Ed448 (EdDSA)", value: "EdDSA448" },
  // ---- HMAC ----
  { label: "HS256 (HMAC)", value: "HS256" },
  { label: "HS384 (HMAC)", value: "HS384" },
  { label: "HS512 (HMAC)", value: "HS512" },
];

// Extract public key as string for display
export function extractPublicKeyString(importedKey: ImportedKey): string {
  if (importedKey.keyType === "pem") {
    return importedKey.publicKey as string;
  } else {
    // For JWK, return formatted JSON
    return JSON.stringify(importedKey.publicKey, null, 2);
  }
}
