import { encodeJWT } from "./encode";
import { importSimplifiedKey } from "./key-import";

// Define a standard payload for the generated JWT
const defaultPayload = {
  name: "PRAS Samin",
  admin: true,
  github: "https://github.com/PRASSamin",
};

/**
 * Generates a JWT example on-the-fly for a given algorithm.
 *
 * @param algorithm - The JWT algorithm to use (e.g., "RS256", "HS256").
 * @returns A promise that resolves to an object containing the JWT and the corresponding key.
 */
export async function generateJwtExample(
  algorithm: string
): Promise<{ jwt: string; key: string }> {
  // For "none" algorithm, no key is needed, and the payload is simple
  if (algorithm === "none") {
    const jwt = await encodeJWT({
      algo: "none",
      payload: defaultPayload,
      key: "",
    });
    return { jwt, key: "" };
  }

  // Determine the key type based on the algorithm
  const keyType = algorithm.startsWith("HS") ? "secret" : "pem";

  // Import a new key pair using the simplified key import function
  const { privateKey, publicKey } = await importSimplifiedKey({
    algorithm,
    keyType,
  });

  // The key to be used for encoding (private key for asymmetric, secret for symmetric)
  const encodingKey = privateKey;

  // The key to be displayed or used for verification (public key for asymmetric, secret for symmetric)
  const verificationKey =
    keyType === "secret" ? (privateKey as string) : (publicKey as string);

  // Encode the JWT with the generated key and default payload
  const jwt = await encodeJWT({
    algo: algorithm,
    key: encodingKey,
    payload: defaultPayload,
    type: keyType,
  });

  return { jwt, key: verificationKey };
}
