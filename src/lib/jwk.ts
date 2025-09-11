import {
  generateECDSA,
  generateOCT,
  generateOKP,
  generateRSA,
  generateRsaOaep,
  isOCTAlgo,
} from "./keypair";
import { JwkOptions } from "../types";

type KeyOpsMap = Record<string, string[]>;

// Map of "algo group" -> allowed key_ops
export const KEY_OPS: KeyOpsMap = {
  RS: ["sign", "verify"], // RSASSA-PKCS1-v1_5
  PS: ["sign", "verify"], // RSASSA-PSS
  ES: ["sign", "verify"], // ECDSA
  Ed: ["sign", "verify"], // EdDSA
  HMAC: ["sign", "verify"], // HMAC

  ECDH: ["deriveKey", "deriveBits"], // ECDH-ES

  "RSA-OAEP": ["encrypt", "wrapKey", "decrypt", "unwrapKey"], // RSA-OAEP family

  "AES-GCM": ["encrypt", "decrypt", "wrapKey", "unwrapKey"], // AES-GCM key encryption
  "AES-KW": ["wrapKey", "unwrapKey"], // AES key wrap
  "AES-GCMKW": ["wrapKey", "unwrapKey"], // AES-GCM key wrap
};

export class JwkKeyOpsHelper {
  private algo: string;
  private selectedOps: string[];

  constructor(algo: string, selectedOps?: string[]) {
    this.algo = algo;
    this.selectedOps = selectedOps || [];
  }

  private validPublicOps(): string[] {
    const ops = ["verify", "deriveKey", "deriveBits", "encrypt", "wrapKey"];
    return ops;
  }

  private validPrivateOps(): string[] {
    const ops = ["sign", "deriveKey", "deriveBits", "decrypt", "unwrapKey"];
    return ops;
  }

  public getAlgoKey(): string | null {
    /**
     *  RS256, RS384, RS512
     */
    if (this.algo.startsWith("RS") && !this.algo.startsWith("RSA-OAEP"))
      return "RS";
    /**
     *  PS256, PS384, PS512
     */
    if (this.algo.startsWith("PS")) return "PS";
    /**
     *  ES256, ES384, ES512, ES256K
     */
    if (this.algo.startsWith("ES")) return "ES";
    /**
     *  EdDSA
     */
    if (this.algo === "EdDSA") return "Ed";
    /**
     *  HS256, HS384, HS512
     */
    if (this.algo.startsWith("HS")) return "HMAC";
    /**
     *  ECDH-ES, ECDH-ES+A256KW
     */
    if (this.algo.startsWith("ECDH")) return "ECDH";
    /**
     *  RSA-OAEP, RSA-OAEP-256
     */
    if (this.algo.startsWith("RSA-OAEP")) return "RSA-OAEP";
    /**
     *  A128GCMKW, A192GCMKW, A256GCMKW
     */
    if (
      this.algo === "A128GCMKW" ||
      this.algo === "A192GCMKW" ||
      this.algo === "A256GCMKW"
    )
      return "AES-GCMKW";
    /**
     *  A128KW, A192KW, A256KW
     */
    if (
      this.algo === "A128KW" ||
      this.algo === "A192KW" ||
      this.algo === "A256KW"
    )
      return "AES-KW";
    /**
     *  A128GCM, A192GCM, A256GCM
     */
    if (
      this.algo === "A128GCM" ||
      this.algo === "A192GCM" ||
      this.algo === "A256GCM"
    )
      return "AES-GCM";
    return null;
  }

  public getPublicOps(): string[] {
    const validOps = this.validPublicOps();
    // filter out ops that are only private (like decrypt/unwrap for RSA-OAEP)
    return this.selectedOps.filter(
      (op) =>
        [
          "encrypt",
          "wrapKey",
          "sign",
          "verify",
          "deriveKey",
          "deriveBits",
        ].includes(op) &&
        validOps.includes(op) &&
        !["decrypt", "unwrapKey"].includes(op)
    );
  }

  public getPrivateOps(): string[] {
    const validOps = this.validPrivateOps();
    // filter out ops that are only public (like encrypt/wrap for RSA-OAEP)
    return this.selectedOps.filter(
      (op) =>
        [
          "decrypt",
          "unwrapKey",
          "sign",
          "verify",
          "deriveKey",
          "deriveBits",
        ].includes(op) &&
        validOps.includes(op) &&
        !["encrypt", "wrapKey"].includes(op)
    );
  }
}

export async function generateJwkPair(
  options: {
    algorithm: string;
    keySize?: number;
    curve?: string;
    octSizeBytes?: number;
    pkcsVersion?: 1 | 8;
  } & JwkOptions
): Promise<{ publicJwk: any; privateJwk: any | null }> {
  const { algorithm, keySize, curve, octSizeBytes, pkcsVersion, ...rest } =
    options;

  // HMAC / symmetric
  if (isOCTAlgo(algorithm)) {
    const { jwk } = await generateOCT(algorithm, { octSizeBytes, ...rest });
    return { privateJwk: null, publicJwk: jwk };
  }

  // RSA-OAEP (encryption/decryption)
  if (algorithm.startsWith("RSA-OAEP")) {
    const { publicJwk, privateJwk } = await generateRsaOaep(algorithm, {
      keySize,
      pkcsVersion,
      ...rest,
    });
    return { publicJwk, privateJwk };
  }

  // Noble-curves based OKP
  if (algorithm === "EdDSA" || algorithm.startsWith("ECDH-ES")) {
    const pair = await generateOKP(algorithm as "EdDSA" | "ECDH-ES", {
      curve,
      ...rest,
    });
    return {
      publicJwk: pair?.publicJwk,
      privateJwk: pair?.privateJwk,
    };
  }

  // ECDSA (P-256, P-384, P-521, secp256k1)
  if (algorithm.startsWith("ES")) {
    if (!curve || !["P-256", "P-384", "P-521", "secp256k1"].includes(curve)) {
      throw new Error("Invalid curve for ECDSA");
    }
    const { publicJwk, privateJwk } = await generateECDSA(algorithm, {
      curve: curve as "P-256" | "P-384" | "P-521" | "secp256k1",
      ...rest,
    });
    return { publicJwk, privateJwk };
  }

  // RSA
  if (algorithm.startsWith("RS") || algorithm.startsWith("PS")) {
    const { publicJwk, privateJwk } = await generateRSA(algorithm, {
      keySize,
      pkcsVersion,
      ...rest,
    });
    return { publicJwk, privateJwk };
  }

  throw new Error("Unsupported algorithm for JWK generation");
}
