import * as jose from "jose";

/**
 * Import secp256k1 (public or private) key from PEM into raw Uint8Array
 *
 * Supports:
 *   - Public keys in SPKI (BIT STRING)
 *   - Private keys in PKCS#8 / SEC1 (OCTET STRING)
 *
 * @param pem - PEM string
 * @param isPublicKey - true if importing public key
 * @returns Uint8Array raw key bytes
 */
export function importSecp256k1Pem(pem: string, isPublicKey: boolean = false): Uint8Array {
  // Remove headers, footers, whitespace, decode base64
  const base64 = pem.replace(/-----.*-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  if (isPublicKey) {
    // Public key: find BIT STRING (0x03)
    for (let i = 0; i < der.length; i++) {
      if (der[i] === 0x03) {
        let length = der[i + 1];
        let headerOffset = 2;

        // handle long-form length
        if (length & 0x80) {
          const numBytes = length & 0x7f;
          length = 0;
          for (let j = 0; j < numBytes; j++) {
            length = (length << 8) | der[i + 2 + j];
          }
          headerOffset += numBytes;
        }

        const raw = der.slice(i + headerOffset + 1, i + headerOffset + 1 + (length - 1));

        if (raw[0] === 0x04 && raw.length === 65) {
          return raw; // uncompressed pubkey: 0x04 || X || Y
        }

        throw new Error(
          `Unexpected BIT STRING length or format: ${raw.length} bytes, first byte=${raw[0]}`
        );
      }
    }
    throw new Error("No BIT STRING found in DER public key");
  } else {
    // Private key: look for OCTET STRING (0x04 0x20)
    for (let i = 0; i <= der.length - 32; i++) {
      if (der[i] === 0x04 && der[i + 1] === 0x20) {
        return der.slice(i + 2, i + 34); // 32-byte secp256k1 private key
      }
    }
    throw new Error("Could not extract secp256k1 private key from PEM");
  }
}

/**
 * Import EdDSA (Ed25519 / Ed448) public or private key from PEM into raw Uint8Array
 *
 * @param pem - PEM string
 * @param keyLength - expected key length in bytes (32 for Ed25519, 57 for Ed448)
 * @param isPublicKey - true if importing public key
 * @returns Uint8Array of raw key bytes
 */
export function importEdDSAPem(
  pem: string,
  keyLength: number,
  isPublicKey = false
): Uint8Array {
  // Strip headers/footers and whitespace
  const base64 = pem.replace(/-----.*-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  if (isPublicKey) {
    // Search for BIT STRING (0x03) that wraps the public key
    let i = 0;
    while (i < der.length - keyLength) {
      if (der[i] === 0x03) {
        let length = der[i + 1];
        let headerOffset = 2;

        // Handle long-form length encoding
        if (length & 0x80) {
          const numBytes = length & 0x7f;
          length = 0;
          for (let j = 0; j < numBytes; j++) {
            length = (length << 8) | der[i + 2 + j];
          }
          headerOffset += numBytes;
        }

        // length includes unused bits byte
        if (length === keyLength + 1) {
          return der.slice(i + headerOffset + 1, i + headerOffset + 1 + keyLength);
        }
      }
      i++;
    }
  } else {
    // Search for OCTET STRING (0x04) with correct key length
    for (let i = 0; i <= der.length - keyLength; i++) {
      if (der[i] === 0x04 && der[i + 1] === keyLength) {
        return der.slice(i + 2, i + 2 + keyLength);
      }
    }
  }

  // Fallback: last keyLength bytes if nothing found
  if (der.length >= keyLength) {
    return der.slice(-keyLength);
  }

  throw new Error(
    `Could not extract EdDSA ${isPublicKey ? "public" : "private"} key from PEM (expected ${keyLength} bytes)`
  );
}

/**
 * Import Ed448 Unit8Array Public JWK
 * @returns {Uint8Array}
 */
export function importEd448Jwk(jwk: jose.JWK) {
  if (jwk.kty !== "OKP" || jwk.crv !== "Ed448") {
    throw new Error("JWK must be an OKP key with Ed448 curve");
  }

  if (!jwk.x) {
    throw new Error("JWK must contain public key component 'x'");
  }

  const publicKey = jose.base64url.decode(jwk.x);
  if (publicKey.length !== 57) {
    throw new Error("Ed448 public key must be 57 bytes");
  }

  return publicKey;
}

/**
 * Import secp256k1 Unit8Array Public JWK
 * @returns {Uint8Array}
 */
export function importSecp256k1Jwk(jwk: jose.JWK): Uint8Array {
  if (jwk.kty !== "EC" || jwk.crv !== "secp256k1") {
    throw new Error("JWK must be an EC key with secp256k1 curve");
  }

  if (!jwk.x || !jwk.y) {
    throw new Error("JWK must contain public key components 'x' and 'y'");
  }

  // Decode x and y coordinates
  const x = jose.base64url.decode(jwk.x);
  const y = jose.base64url.decode(jwk.y);

  if (x.length !== 32 || y.length !== 32) {
    throw new Error("Invalid secp256k1 public key coordinates");
  }

  // Create uncompressed public key: 0x04 + x + y
  const publicKey = new Uint8Array(65);
  publicKey[0] = 0x04;
  publicKey.set(x, 1);
  publicKey.set(y, 33);

  return publicKey;
}
