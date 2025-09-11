import * as jose from "jose";
import { ed448 } from "@noble/curves/ed448";
import { secp256k1 } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha2";

import {
  importEd448Jwk,
  importEdDSAPem,
  importSecp256k1Jwk,
  importSecp256k1Pem,
} from "./util-helpers";

/**
 * Decode JWT header + payload without verifying signature
 */
export function decodeJWT(token: string) {
  let header: jose.JWSHeaderParameters | null = null;
  let payload: any = null;

  try {
    header = jose.decodeProtectedHeader(token);
  } catch {}

  try {
    payload = jose.decodeJwt(token);
  } catch {}

  return { header, payload, algorithm: header?.alg };
}

/**
 * Verify JWT with JWK, PEM, or shared secret
 */
export async function verifyJWT(
  token: string,
  key: string
): Promise<{ valid: boolean; payload?: any; error?: string }> {
  try {
    const { algorithm: alg } = decodeJWT(token);
    if (alg === "none")
      return { valid: true, payload: decodeJWT(token).payload };
    if (!alg) throw new Error("JWT missing algorithm");

    const [headerB64, payloadB64, sigB64] = token.split(".");
    const message = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signature = jose.base64url.decode(sigB64);

    let cryptoKey: Uint8Array | jose.CryptoKey | null = null;

    // --- Try parsing JWK first ---
    if (key.trim().startsWith("{")) {
      try {
        const jwk = JSON.parse(key);
        switch (alg) {
          case "Ed448":
            cryptoKey = importEd448Jwk(jwk);
            break;
          case "ES256K":
            cryptoKey = importSecp256k1Jwk(jwk);
            break;
          default:
            cryptoKey = await jose.importJWK(jwk, alg);
        }
      } catch {
        // Ignore, fallback to PEM/secret
      }
    }

    // --- Try PEM ---
    if (!cryptoKey && key.includes("-----BEGIN")) {
      switch (alg) {
        case "Ed448":
          cryptoKey = importEdDSAPem(key, 57, true);
          break;
        case "ES256K":
          cryptoKey = importSecp256k1Pem(key, true);
          break;
        default:
          cryptoKey = await jose.importSPKI(key, alg);
      }
    }

    // --- Try HMAC secret ---
    if (!cryptoKey && alg.startsWith("HS")) {
      cryptoKey = new TextEncoder().encode(key);
    }

    if (!cryptoKey) {
      throw new Error(
        `Unsupported key format. Provide JWK, PEM, or secret for ${alg}`
      );
    }

    // --- Noble curve verification ---
    if (alg === "Ed448") {
      const valid = ed448.verify(signature, message, cryptoKey as Uint8Array);
      return { valid, payload: decodeJWT(token).payload };
    }

    if (alg === "ES256K") {
      const msgHash = sha256(message); // secp256k1 requires hash
      const valid = secp256k1.verify(
        signature,
        msgHash,
        cryptoKey as Uint8Array
      );
      return { valid, payload: decodeJWT(token).payload };
    }

    // --- Fallback: jose verification ---
    const { payload } = await jose.jwtVerify(token, cryptoKey, {
      algorithms: [alg],
    });
    return { valid: true, payload };
  } catch (err: any) {
    console.error("JWT verification failed:", err);
    return { valid: false, error: err.message };
  }
}
