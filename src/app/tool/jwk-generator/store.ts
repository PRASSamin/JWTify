"use client";

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { addToast } from "@heroui/react";
import { generateJwkPair, KEY_OPS } from "@/lib/jwk";
import { isOCTAlgo } from "@/lib/keypair";

export const ALGORITHMS = [
  // ---- HMAC ----
  { label: "HS256 (HMAC)", value: "HS256" },
  { label: "HS384 (HMAC)", value: "HS384" },
  { label: "HS512 (HMAC)", value: "HS512" },

  // ---- RSA Signatures ----
  { label: "RS256 (RSA)", value: "RS256" },
  { label: "RS384 (RSA)", value: "RS384" },
  { label: "RS512 (RSA)", value: "RS512" },
  { label: "PS256 (RSA-PSS)", value: "PS256" },
  { label: "PS384 (RSA-PSS)", value: "PS384" },
  { label: "PS512 (RSA-PSS)", value: "PS512" },

  // ---- ECDSA Signatures ----
  { label: "ES256 (ECDSA P-256)", value: "ES256" },
  { label: "ES384 (ECDSA P-384)", value: "ES384" },
  { label: "ES512 (ECDSA P-521)", value: "ES512" },
  { label: "ES256K (ECDSA secp256k1)", value: "ES256K" },

  // ---- RSA Encryption / Key Wrap ----
  { label: "RSA-OAEP", value: "RSA-OAEP" },
  { label: "RSA-OAEP-256", value: "RSA-OAEP-256" },
  { label: "RSA-OAEP-384", value: "RSA-OAEP-384" },
  { label: "RSA-OAEP-512", value: "RSA-OAEP-512" },

  // ---- Edwards Signatures ----
  { label: "EdDSA (Ed25519 / Ed448)", value: "EdDSA" },

  // ---- ECDH Key Agreement ----
  { label: "ECDH-ES (X25519 / X448)", value: "ECDH-ES" },
  { label: "ECDH-ES+A128KW", value: "ECDH-ES+A128KW" },
  { label: "ECDH-ES+A192KW", value: "ECDH-ES+A192KW" },
  { label: "ECDH-ES+A256KW", value: "ECDH-ES+A256KW" },

  // ---- AES Key Wrap ----
  { label: "A128KW (AES Key Wrap)", value: "A128KW" },
  { label: "A192KW (AES Key Wrap)", value: "A192KW" },
  { label: "A256KW (AES Key Wrap)", value: "A256KW" },

  // ---- AES GCM Key Wrap ----
  { label: "A128GCMKW (AES-GCM Key Wrap)", value: "A128GCMKW" },
  { label: "A192GCMKW (AES-GCM Key Wrap)", value: "A192GCMKW" },
  { label: "A256GCMKW (AES-GCM Key Wrap)", value: "A256GCMKW" },

  // ---- AES GCM Content Encryption ----
  { label: "A128GCM (AES-GCM Content Encrypt)", value: "A128GCM" },
  { label: "A192GCM (AES-GCM Content Encrypt)", value: "A192GCM" },
  { label: "A256GCM (AES-GCM Content Encrypt)", value: "A256GCM" },

  // ---- Future / Soon ----
  { label: "PBES2-HS256+A128KW", value: "PBES2-HS256+A128KW", soon: true },
  { label: "PBES2-HS384+A192KW", value: "PBES2-HS384+A192KW", soon: true },
  { label: "PBES2-HS512+A256KW", value: "PBES2-HS512+A256KW", soon: true },
  { label: "XC20P (ChaCha20Poly1305 KW)", value: "XC20P", soon: true },
];

export const octSizes = [16, 32, 48, 64];

export const rsaSizes = [
  { value: 1024, label: "1024 bits (legacy)" },
  { value: 2048, label: "2048 bits (standard)" },
  { value: 3072, label: "3072 bits" },
  { value: 4096, label: "4096 bits" },
  { value: 8192, label: "8192 bits (overkill)" },
];

export const ecCurves = ["P-256", "P-384", "P-521", "secp256k1"];
export const edCurves = ["Ed25519", "Ed448"];
export const ecdhCurves = ["X25519", "X448"];

export const allKeyOps = Array.from(new Set(Object.values(KEY_OPS).flat()));

const normalizeKeyMetadata = (algorithm: string) => {
  // defaults
  let use = "sig";
  let key_ops: string[] = ["sign", "verify"];

  if (algorithm.startsWith("RSA-OAEP")) {
    use = "enc";
    key_ops = ["encrypt", "decrypt"];
  } else if (!algorithm.startsWith("HS") && isOCTAlgo(algorithm)) {
    use = "enc";
    key_ops = ["wrapKey", "unwrapKey"];
  } else if (
    algorithm.startsWith("RS") ||
    algorithm.startsWith("PS") ||
    algorithm.startsWith("ES") ||
    algorithm.startsWith("HS") ||
    algorithm === "EdDSA"
  ) {
    use = "sig";
    key_ops = ["sign", "verify"];
  } else if (algorithm.startsWith("ECDH")) {
    use = "enc";
    key_ops = ["deriveKey", "deriveBits"];
  }

  return { use, alg: algorithm, key_ops };
};

interface JwkState {
  algorithm: string;
  keySize: number;
  kid: string;
  useKey: string;
  keyOps: string[];
  curve: string;
  jwkPrivate: any | null;
  jwkPublic: any | null;
  jwkSet: any | null;
  octSize: number;
  loading: boolean;
  actions: {
    setAlgorithm: (algorithm: string) => void;
    setKeySize: (keySize: number) => void;
    setKid: (kid: string) => void;
    setUseKey: (useKey: string) => void;
    setKeyOps: (keyOps: string[]) => void;
    setCurve: (curve: string) => void;
    setOctSize: (octSize: number) => void;
    generate: () => Promise<void>;
    resetKid: () => void;
  };
}

export const useJwkStore = create<JwkState>((set, get) => ({
  algorithm: "RS256",
  keySize: 2048,
  kid: uuidv4(),
  useKey: "sig",
  keyOps: ["sign", "verify"],
  curve: "Ed25519",
  jwkPrivate: null,
  jwkPublic: null,
  jwkSet: null,
  octSize: 32,
  loading: false,
  actions: {
    setAlgorithm: (algorithm) => {
      const { use, alg, key_ops } = normalizeKeyMetadata(algorithm);

      const curveMap: Record<string, string> = {
        "256": "P-256",
        "384": "P-384",
        "512": "P-521",
        "256K": "secp256k1",
      };

      let defaultCurve: string | undefined = get().curve;
      let defaultOctSize: number | undefined = get().octSize;

      const ecdsaMatch = algorithm.match(/^ES(\d+|256K)$/);
      if (ecdsaMatch) {
        const curveSize = ecdsaMatch[1];
        if (!(curveSize in curveMap)) {
          throw new Error(
            `Unsupported ECDSA curve size: ${curveSize}. Supported: 256, 384, 521, 256K`
          );
        }
        defaultCurve = curveMap[curveSize];
      } else if (algorithm.startsWith("ECDH")) {
        defaultCurve = "X25519";
      } else if (algorithm === "EdDSA") {
        defaultCurve = "Ed25519";
      } else if (isOCTAlgo(algorithm) && !algorithm.startsWith("HS")) {
        defaultOctSize = 32; // Default for non-HMAC OCT algorithms
      }

      set({
        algorithm: alg,
        useKey: use,
        keyOps: key_ops || get().keyOps,
        octSize: defaultOctSize,
        curve: defaultCurve,
      });
    },

    setKeySize: (keySize) => set({ keySize }),
    setKid: (kid) => set({ kid }),
    setUseKey: (useKey) => set({ useKey }),
    setKeyOps: (keyOps) => set({ keyOps }),
    setCurve: (curve) => set({ curve }),
    setOctSize: (octSize) => set({ octSize }),
    resetKid: () => set({ kid: uuidv4() }),
    generate: async () => {
      set({ loading: true });
      const { algorithm, keySize, curve, octSize, useKey, kid, keyOps } = get();

      try {
        const { publicJwk, privateJwk } = await generateJwkPair({
          algorithm,
          keySize,
          curve,
          octSizeBytes: octSize,
          use: useKey,
          kid,
          key_ops: keyOps,
        });

        set({
          jwkPrivate: privateJwk,
          jwkPublic: publicJwk,
          jwkSet: { keys: [publicJwk] },
        });
      } catch (err: any) {
        console.error(err);
        addToast({
          title: "JWK Generator Error",
          description: err?.message || String(err),
          color: "danger",
        });
        set({ jwkPrivate: null, jwkPublic: null, jwkSet: null });
      } finally {
        set({ loading: false });
      }
    },
  },
}));
