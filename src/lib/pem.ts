import {
  generateECDSA,
  generateOKP,
  generateRSA,
  generateRsaOaep,
} from "./keypair";

export async function generatePemPair({
  algorithm,
  keySize,
  pkcsVersion = 8,
  curve,
}: {
  algorithm: string;
  keySize?: number;
  curve?:
    | ("P-256" | "P-384" | "P-521" | "secp256k1")
    | ("Ed25519" | "Ed448")
    | ("X25519" | "X448");
  pkcsVersion?: 1 | 8;
}) {
  let privateKey;
  let publicKey;
  let fullGeneration;

  // RSA-OAEP (encryption/decryption)
  if (algorithm.startsWith("RSA-OAEP")) {
    const pair = await generateRsaOaep(algorithm, {
      keySize,
      pkcsVersion: pkcsVersion || 8,
    });
    privateKey = pair.privatePem;
    publicKey = pair.publicPem;
    fullGeneration = pair;
  } else if (algorithm.startsWith("RS") || algorithm.startsWith("PS")) {
    const pair = await generateRSA(algorithm, {
      keySize,
      pkcsVersion: pkcsVersion || 8,
    });
    privateKey = pair.privatePem;
    publicKey = pair.publicPem;
    fullGeneration = pair;
  } else if (algorithm.startsWith("ES")) {
    if (!curve) {
      throw new Error("Curve is required for ECDSA");
    }
    const pair = await generateECDSA(algorithm, {
      curve: curve as "P-256" | "P-384" | "P-521" | "secp256k1",
    });
    privateKey = pair.privatePem;
    publicKey = pair.publicPem;
    fullGeneration = pair;
  } else if (algorithm === "EdDSA" || algorithm.startsWith("ECDH-ES")) {
    const pair = await generateOKP(algorithm as "EdDSA" | "ECDH-ES", { curve });
    privateKey = pair.privatePem;
    publicKey = pair.publicPem;
    fullGeneration = pair;
  } else {
    throw new Error(`Unsupported algorithm: ${algorithm}`);
  }

  return {
    privateKey,
    publicKey,
    fullGeneration,
  };
}
