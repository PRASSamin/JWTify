"use client";

import { create } from "zustand";
import { addToast } from "@heroui/react";
import { generatePemPair } from "@/lib/pem";

export const ALGORITHMS = [
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
  { label: "EdDSA (Ed25519 / Ed448)", value: "EdDSA" },
  { label: "ECDH-ES (X25519 / X448)", value: "ECDH-ES" },
];

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
export const pkcsVersions = [
  { value: 1, label: "PKCS#1" },
  { value: 8, label: "PKCS#8" },
];

interface PemState {
  algorithm: string;
  keySize: number;
  privateKey: string;
  publicKey: string;
  fullGeneration: Record<string, any>;
  loading: boolean;
  pkcsVersion: 1 | 8;
  curve: string;
  actions: {
    setAlgorithm: (algorithm: string) => void;
    setKeySize: (keySize: number) => void;
    setPkcsVersion: (version: 1 | 8) => void;
    setCurve: (curve: string) => void;
    generate: () => Promise<void>;
  };
}

export const usePemStore = create<PemState>((set, get) => ({
  algorithm: "RS256",
  keySize: 2048,
  privateKey: "",
  publicKey: "",
  fullGeneration: {},
  loading: false,
  pkcsVersion: 8,
  curve: "P-256",
  actions: {
    setAlgorithm: (algorithm) => {
      const curveMap: Record<string, string> = {
        "256": "P-256",
        "384": "P-384",
        "512": "P-521",
        "256K": "secp256k1",
      };

      let defaultCurve: string | undefined = get().curve;

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
      }

      set({ algorithm, curve: defaultCurve });
    },
    setKeySize: (keySize) => set({ keySize }),
    setPkcsVersion: (version) => set({ pkcsVersion: version }),
    setCurve: (curve) => set({ curve }),
    generate: async () => {
      set({ loading: true });
      const { algorithm, keySize, curve, pkcsVersion } = get();
      try {
        const response = await generatePemPair({
          algorithm,
          keySize,
          curve: curve as any,
          pkcsVersion,
        });
        set({
          privateKey: response.privateKey as string,
          publicKey: response.publicKey as string,
          fullGeneration: response.fullGeneration,
        });
      } catch (error: any) {
        addToast({
          title: "PEM Generator Error",
          description: error.message,
          color: "danger",
        });
        set({ privateKey: "", publicKey: "", fullGeneration: {} });
      } finally {
        set({ loading: false });
      }
    },
  },
}));
