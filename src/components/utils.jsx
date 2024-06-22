export const base64UrlEncode = (arrayBuffer) => {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

export const base64UrlDecode = (input) => {
  input = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = input.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error("Invalid base64url string!");
    }
    input += "=".repeat(4 - pad);
  }
  const rawData = atob(input);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
};

export const decodeJWTPart = (tokenPart) => {
  try {
    const arrayBuffer = base64UrlDecode(tokenPart);
    const jsonString = new TextDecoder().decode(arrayBuffer);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error decoding token part:", error);
    return {};
  }
};

export const pemToArrayBuffer = (pem) => {
  if (typeof pem !== "string") {
    throw new Error("Invalid PEM format: PEM must be a string");
  }
  const base64 = pem
    .replace(/-----BEGIN (.*)-----/, "")
    .replace(/-----END (.*)-----/, "")
    .replace(/\s+/g, "")
    .replace(/(\r\n|\n|\r)/gm, "");
  const binaryString = atob(base64);
  const byteArray = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    byteArray[i] = binaryString.charCodeAt(i);
  }
  return byteArray.buffer;
};

const verifyHMAC = async (token, secret, hash) => {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Token structure incorrect");
  }

  const data = `${parts[0]}.${parts[1]}`;
  const dataBuffer = new TextEncoder().encode(data);
  const secretBuffer = new TextEncoder().encode(secret.key || secret);

  const key = await crypto.subtle.importKey(
    "raw",
    secretBuffer,
    { name: "HMAC", hash },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, dataBuffer);
  const newSignature = base64UrlEncode(signatureBuffer);

  return newSignature === parts[2];
};

const verifyRSA = async (token, publicKeyPem, hash) => {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Token structure incorrect");
  }

  const data = `${parts[0]}.${parts[1]}`;
  const dataBuffer = new TextEncoder().encode(data);
  const publicKeyArrayBuffer = pemToArrayBuffer(publicKeyPem.key || publicKeyPem);

  const publicKey = await crypto.subtle.importKey(
    "spki",
    publicKeyArrayBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash },
    false,
    ["verify"]
  );

  const signature = base64UrlDecode(parts[2]);

  return await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    signature,
    dataBuffer
  );
};

const verifyECDSA = async (token, publicKeyPem, namedCurve, hash) => {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Token structure incorrect");
  }

  const data = `${parts[0]}.${parts[1]}`;
  const dataBuffer = new TextEncoder().encode(data);
  const publicKeyArrayBuffer = pemToArrayBuffer(publicKeyPem.key || publicKeyPem);

  const publicKey = await crypto.subtle.importKey(
    "spki",
    publicKeyArrayBuffer,
    { name: "ECDSA", namedCurve },
    false,
    ["verify"]
  );

  const signature = base64UrlDecode(parts[2]);

  return await crypto.subtle.verify(
    { name: "ECDSA", hash },
    publicKey,
    signature,
    dataBuffer
  );
};

export const verifyHS256 = (token, secret) => verifyHMAC(token, secret, "SHA-256");
export const verifyHS384 = (token, secret) => verifyHMAC(token, secret, "SHA-384");
export const verifyHS512 = (token, secret) => verifyHMAC(token, secret, "SHA-512");

export const verifyRS256 = (token, publicKeyPem) => verifyRSA(token, publicKeyPem, { name: "SHA-256" });
export const verifyRS384 = (token, publicKeyPem) => verifyRSA(token, publicKeyPem, { name: "SHA-384" });
export const verifyRS512 = (token, publicKeyPem) => verifyRSA(token, publicKeyPem, { name: "SHA-512" });

export const verifyES256 = (token, publicKeyPem) => verifyECDSA(token, publicKeyPem, "P-256", { name: "SHA-256" });
export const verifyES384 = (token, publicKeyPem) => verifyECDSA(token, publicKeyPem, "P-384", { name: "SHA-384" });
export const verifyES512 = (token, publicKeyPem) => verifyECDSA(token, publicKeyPem, "P-521", { name: "SHA-512" });
