"use client";

import { create } from "zustand";
import { generateJwtExample } from "@/lib/jwt-example-import";
import { decodeJWT, verifyJWT } from "@/lib/decoder";

export const EXAMPLE_ALGORITHMS = [
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

interface DecodedToken {
  header: object;
  payload: object;
  algorithm: string;
}

interface DecoderState {
  jwt: string;
  key: string;
  decodedToken: DecodedToken | null;
  isVerified: boolean | null;
  actions: {
    setJwt: (jwt: string) => void;
    setKey: (key: string) => void;
    verifySignature: () => Promise<void>;
    importExample: (data: { algorithm: string }) => void;
    decode: () => void;
  };
}

export const useDecoderStore = create<DecoderState>((set, get) => ({
  jwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTc1MDQwMTMsIm5hbWUiOiJQUkFTIFNhbWluIiwiYWRtaW4iOnRydWUsImdpdGh1YiI6Imh0dHBzOi8vZ2l0aHViLmNvbS9QUkFTU2FtaW4ifQ.su7zQB4Azbmzin0BHNwFaB14QB1xGC0r-YBldMetSvI",
  key: "",
  decodedToken: null,
  isVerified: null,
  actions: {
    setJwt: (jwt) => {
      const {
        actions: { verifySignature, decode },
      } = get();

      set({ jwt });
      decode();
      verifySignature();
    },
    setKey: (key) => {
      const {
        actions: { verifySignature },
      } = get();
      set({ key });
      verifySignature();
    },
    verifySignature: async () => {
      const { key, jwt } = get();
      try {
        const { valid } = await verifyJWT(jwt, key);
        set({ isVerified: valid });
      } catch (error) {
        console.error(error);
        set({ isVerified: false });
      }
    },
    decode: () => {
      const { jwt } = get();
      try {
        const decoded = decodeJWT(jwt);
        set({ decodedToken: decoded as any });
      } catch {
        set({ decodedToken: null });
      }
    },
    importExample: async (data) => {
      const { algorithm } = data;
      const {
        actions: { verifySignature, decode },
      } = get();

      try {
        const example = await generateJwtExample(algorithm);
        set({
          jwt: example.jwt,
          key: example.key,
        });
        decode();
        verifySignature();
      } catch (error) {
        console.error(`Failed to generate JWT for ${algorithm}:`, error);
      }
    },
  },
}));
