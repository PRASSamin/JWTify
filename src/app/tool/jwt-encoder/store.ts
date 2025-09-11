"use client";

import { create } from "zustand";
import { z } from "zod";
import { addToast } from "@heroui/react";
import { validateKey } from "@/lib/utils";
import { encodeJWT } from "@/lib/encode";

export const ALGORITHMS = [
  { value: "none", label: "None" },
  // ---- HMAC ----
  { label: "HS256 (HMAC)", value: "HS256" },
  { label: "HS384 (HMAC)", value: "HS384" },
  { label: "HS512 (HMAC)", value: "HS512" },
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
  { label: "Ed25519 (EdDSA)", value: "Ed25519" },
  { label: "Ed448 (EdDSA)", value: "Ed448" },
];

const encoderSchema = z.object({
  algorithm: z.string(),
  payload: z.string().refine(
    (val) => {
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Invalid JSON payload" }
  ),
  key: z.string().optional(),
  keyType: z.enum(["pem", "jwk", "secret"]),
});

interface EncoderState {
  algorithm: string;
  key: string;
  payload: string;
  jwt: string;
  loading: boolean;
  keyType: "pem" | "jwk" | "secret";
  keyValidation: {
    level: "warning" | "error" | string | null;
    message: string;
  };
  publicKey: string;
  isImported: boolean;
  actions: {
    setAlgorithm: (algorithm: string) => void;
    setKey: (key: string) => void;
    setPayload: (payload: string) => void;
    setKeyType: (keyType: "pem" | "jwk" | "secret") => void;
    generateJWT: () => Promise<void>;
    validateCurrentKey: () => Promise<void>;
    importKey: (data: {
      privateKey: string | object;
      publicKey: string | object;
      keyType: "pem" | "jwk" | "secret";
      algorithm: string;
    }) => void;
    clearImportedKey: () => void;
  };
}

export const useEncoderStore = create<EncoderState>((set, get) => ({
  algorithm: "RS256",
  key: "",
  payload: JSON.stringify(
    {
      name: "PRAS Samin",
      admin: true,
      github: "https://github.com/PRASSamin",
    },
    null,
    2
  ),
  jwt: "",
  loading: false,
  keyType: "pem",
  keyValidation: {
    level: null,
    message: "",
  },
  publicKey: "",
  isImported: false,
  actions: {
    setAlgorithm: (algorithm) => {
      let defaultKeyType = get().keyType;
      if (algorithm.startsWith("HS")) {
        defaultKeyType = "secret";
      } else {
        if (get().keyType === "secret") defaultKeyType = "pem";
      }
      set({ algorithm, keyType: defaultKeyType });
      if (algorithm === "none") {
        set({ keyValidation: { level: null, message: "" } });
      }
    },
    setKey: (key) => set({ key, isImported: false, publicKey: "" }),
    setPayload: (payload) => set({ payload }),
    setKeyType: (keyType) =>
      set({ keyType, key: "", isImported: false, publicKey: "" }),
    validateCurrentKey: async () => {
      const { keyType, key, algorithm } = get();
      if (algorithm === "none") {
        set({ keyValidation: { level: null, message: "" } });
        return;
      }
      const result = await validateKey(key, algorithm, keyType);
      set({ keyValidation: result });
    },
    generateJWT: async () => {
      set({ loading: true });
      const { algorithm, keyType, key, payload } = get();

      try {
        const validationResult = encoderSchema.safeParse({
          algorithm,
          payload,
          key,
          keyType,
        });

        if (!validationResult.success) {
          // @ts-expect-error: .
          const errorMessage = validationResult.error.errors[0].message;
          addToast({
            title: "Validation Error",
            description: errorMessage,
            color: "danger",
          });
          return;
        }

        if (algorithm !== "none") {
          if (keyType === "jwk") {
            try {
              JSON.parse(key);
            } catch {
              addToast({
                title: "Invalid JWK",
                description: "The JWK is not a valid JSON object.",
                color: "danger",
              });
              return;
            }
          }
          if (!key || (typeof key === "string" && key.trim() === "")) {
            addToast({
              title: "Invalid key",
              description: "Please enter a key.",
              color: "danger",
            });
            return;
          }
        }

        const jwtResult = await encodeJWT({
          algo: algorithm,
          key: keyType === "jwk" ? JSON.parse(key) : key,
          payload: JSON.parse(payload),
          type: keyType,
        });

        set({ jwt: jwtResult });
      } catch (error: any) {
        console.error(error);
        addToast({
          title: "Error",
          description: error.message || "Something went wrong",
          color: "danger",
        });
      } finally {
        set({ loading: false });
      }
    },
    importKey: (data) => {
      const { privateKey, publicKey, keyType, algorithm } = data;

      // Set the algorithm first (this will trigger keyType updates if needed)
      const actions = get().actions;
      actions.setAlgorithm(algorithm);

      // Convert key to string format
      let keyString: string;
      if (keyType === "jwk") {
        keyString =
          typeof privateKey === "string"
            ? privateKey
            : JSON.stringify(privateKey, null, 2);
      } else {
        keyString = privateKey as string;
      }

      // Set the imported key data
      set({
        key: keyString,
        keyType: keyType,
        publicKey:
          keyType === "jwk"
            ? JSON.stringify(publicKey, null, 2)
            : (publicKey as string),
        isImported: true,
        keyValidation: { level: null, message: "" },
      });
    },
    clearImportedKey: () => {
      set({
        key: "",
        publicKey: "",
        isImported: false,
        keyValidation: { level: null, message: "" },
      });
    },
  },
}));
