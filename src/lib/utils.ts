import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as jose from "jose";
import { secp256k1 } from "@noble/curves/secp256k1";
import { importEdDSAPem, importSecp256k1Pem } from "./util-helpers";
import { ed25519 } from "@noble/curves/ed25519";
import { ed448 } from "@noble/curves/ed448";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  wait: number
) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const wrapped = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
  wrapped.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  return wrapped as T & { cancel: () => void };
}

// Validate key using noble curves
async function validateWithNoble(
  value: string,
  algo: string,
  type: "pem" | "jwk"
): Promise<{ level: "error" | "warning" | null; message: string }> {
  try {
    if (algo === "ES256K") {
      if (type === "jwk") {
        const jwk = JSON.parse(value);
        if (jwk.kty !== "EC" || jwk.crv !== "secp256k1") {
          return {
            level: "error",
            message: "JWK must be EC key with secp256k1 curve for ES256K",
          };
        }
        if (!jwk.d) {
          return {
            level: "error",
            message: "JWK missing private key component 'd'",
          };
        }

        // Validate private key
        const privateKeyBytes = jose.base64url.decode(jwk.d);
        if (privateKeyBytes.length !== 32) {
          return {
            level: "error",
            message: "Invalid secp256k1 private key length",
          };
        }

        // Try to create public key to validate private key
        const publicKey = secp256k1.getPublicKey(privateKeyBytes);
        if (!publicKey) {
          return { level: "error", message: "Invalid secp256k1 private key" };
        }
      } else if (type === "pem") {
        const privateKeyBytes = importSecp256k1Pem(value);

        // Validate the key by generating public key
        const publicKey = secp256k1.getPublicKey(privateKeyBytes);
        if (!publicKey) {
          return {
            level: "error",
            message: "Invalid secp256k1 private key in PEM",
          };
        }
      }
    } else if (algo === "Ed25519") {
      if (type === "jwk") {
        const jwk = JSON.parse(value);
        if (jwk.kty !== "OKP" || jwk.crv !== "Ed25519") {
          return {
            level: "error",
            message: "JWK must be OKP key with Ed25519 curve",
          };
        }
        if (!jwk.d) {
          return {
            level: "error",
            message: "JWK missing private key component 'd'",
          };
        }

        // Validate private key
        const privateKeyBytes = jose.base64url.decode(jwk.d);
        if (privateKeyBytes.length !== 32) {
          return {
            level: "error",
            message: "Invalid Ed25519 private key length",
          };
        }

        // Try to create public key to validate private key
        const publicKey = ed25519.getPublicKey(privateKeyBytes);
        if (!publicKey) {
          return { level: "error", message: "Invalid Ed25519 private key" };
        }
      } else if (type === "pem") {
        const privateKeyBytes = importEdDSAPem(value, 32);

        // Validate the key by generating public key
        const publicKey = ed25519.getPublicKey(privateKeyBytes);
        if (!publicKey) {
          return {
            level: "error",
            message: "Invalid Ed25519 private key in PEM",
          };
        }
      }
    } else if (algo === "Ed448") {
      if (type === "jwk") {
        const jwk = JSON.parse(value);
        if (jwk.kty !== "OKP" || jwk.crv !== "Ed448") {
          return {
            level: "error",
            message: "JWK must be OKP key with Ed448 curve",
          };
        }
        if (!jwk.d) {
          return {
            level: "error",
            message: "JWK missing private key component 'd'",
          };
        }

        // Validate private key
        const privateKeyBytes = jose.base64url.decode(jwk.d);
        if (privateKeyBytes.length !== 57) {
          // Ed448 private key is 57 bytes
          return {
            level: "error",
            message: "Invalid Ed448 private key length",
          };
        }

        // Try to create public key to validate private key
        const publicKey = ed448.getPublicKey(privateKeyBytes);
        if (!publicKey) {
          return { level: "error", message: "Invalid Ed448 private key" };
        }
      } else if (type === "pem") {
        const privateKeyBytes = importEdDSAPem(value, 57);

        // Validate the key by generating public key
        const publicKey = ed448.getPublicKey(privateKeyBytes);
        if (!publicKey) {
          return {
            level: "error",
            message: "Invalid Ed448 private key in PEM",
          };
        }
      }
    }

    return { level: null, message: "" };
  } catch (err: any) {
    console.error(`${algo} key validation failed:`, err);
    return {
      level: "error",
      message: err?.message || `Invalid ${algo} key format`,
    };
  }
}

export const validateKey = async (
  value: string,
  algo: string,
  type: "pem" | "jwk" | "secret"
) => {
  // --- Empty key check ---
  if (!value || value?.trim() === "") {
    return { level: "error", message: "Key cannot be empty" };
  }

  // --- JWK validation ---
  if (type === "jwk") {
    try {
      const jwk = JSON.parse(value);
      if (!jwk.kty) {
        return { level: "error", message: "JWK missing 'kty' property" };
      }

      // Use noble curves for ES256K and EdDSA algorithms
      if (
        algo === "ES256K" ||
        algo === "EdDSA" ||
        algo === "Ed25519" ||
        algo === "Ed448"
      ) {
        return await validateWithNoble(value, algo, type);
      }

      return { level: null, message: "" };
    } catch {
      return { level: "error", message: "Invalid JWK JSON" };
    }
  }

  // --- HMAC / symmetric key validation ---
  if (type === "secret" || algo.startsWith("HS")) {
    const bits = value.length * 8;
    if (bits < 256) {
      return { level: "warning", message: "Secret is weak (<256 bits)" };
    }
    return { level: null, message: "" };
  }

  // --- PEM validation ---
  const trimmed = value.trim();
  if (
    !/^-----BEGIN [A-Z ]+-----/.test(trimmed) ||
    !/-----END [A-Z ]+-----$/.test(trimmed)
  ) {
    return { level: "error", message: "Invalid PEM header or footer" };
  }

  // Validate Base64 content
  const base64Body = trimmed.replace(/-----.*-----/g, "").replace(/\s+/g, "");
  try {
    atob(base64Body);
  } catch {
    return { level: "error", message: "PEM contains invalid Base64 content" };
  }

  // Try actual key import
  try {
    if (algo.startsWith("RS") || algo.startsWith("PS")) {
      await jose.importPKCS8(value, algo);
      // Optional: check key length for RSA
      if (base64Body.startsWith("MIIC") || base64Body.startsWith("MIIB")) {
        return {
          level: "warning",
          message: `RSA key may be too short for ${algo} (recommend 2048+ bits)`,
        };
      }
    } else if (algo === "ES256K" || algo.startsWith("Ed")) {
      // Use noble curves for validation
      return await validateWithNoble(value, algo, type);
    } else if (algo.startsWith("ES")) {
      await jose.importPKCS8(value, algo);
    } else {
      return { level: "error", message: "Unsupported algorithm for PEM" };
    }
  } catch (err: any) {
    console.error("PEM validation failed:", err);
    return {
      level: "error",
      message:
        err?.message || "PEM is corrupted or unsupported for this algorithm",
    };
  }

  return { level: null, message: "" };
};
