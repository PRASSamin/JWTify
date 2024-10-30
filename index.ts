import express, { Request, Response, query } from "express";
import jwt, { SignOptions, Algorithm } from "jsonwebtoken";
import cors from "cors";
import { urlWhitelistMiddleware } from "./src/whitelistMiddleware";

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(urlWhitelistMiddleware);

app.get("/", (req: Request, res: Response) => {
  res.json({
    api: {
      endpoint: "https://jwt-backend-eta.vercel.app/api/generate-jwt/",
      method: "GET",
      access: "Private"
    },
    parameters: {
      required: {
        algorithm: {
          type: "String",
          description: "JWT signing algorithm",
          examples: ["RS256", "HS256"]
        },
        payload: {
          type: "JSON (URL-encoded)",
          description: "JWT claims set",
          example: JSON.stringify({
            sub: "1234567890",
            name: "PRAS Samin",
            admin: true
          })
        }
      }
    },
    queryParameters: {
      description: "One required based on algorithm",
      options: {
        pk: {
          type: "String (Optional)",
          description: "Public key for asymmetric algorithms",
          format: "PEM",
          example: "-----BEGIN PUBLIC KEY-----\nPUBLIC KEY CONTENT\n-----END PUBLIC KEY-----"
        },
        sk: {
          type: "String (Optional)",
          description: "Secret key for symmetric algorithms",
          format: "Raw string",
          example: "Your-256-bit-Secret-Key"
        }
      }
    },
    usage: {
      description: "Example API call",
      url: "https://jwt-backend-eta.vercel.app/api/generate-jwt/RS256/%7B%22sub%22%3A%221234567890%22%2C%22name%22%3A%22John+Doe%22%2C%22admin%22%3Atrue%7D"
    },
    additionalInformation: {
      webApp: {
        description: "For JWT encoding/decoding, please use our web application",
        url: "https://jwtify.onrender.com"
      },
      apiAccess: {
        description: "For API access requests, please contact us",
        email: "prassamin@gmail.com"
      }
    }
  });
})


app.get("/api/generate-jwt/:algorithm/:payload", (req: Request, res: Response) => {
  const { algorithm, payload } = req.params;
  const { pk, sk } = req.query;

  if (!pk && !sk) {
    return res.status(400).json({ error: "PrivateKey or SecretKey is required" });
  }

  let reformattedPayload: any;
  try {
    const decodedPayload = decodeURIComponent(payload);
    reformattedPayload = JSON.parse(decodedPayload); 
  } catch (err) {
    console.error("Error parsing payload:", err);
    return res.status(400).json({ error: "Invalid payload format" });
  }

  const formatedKey = formatPrivateKey(pk as string);

  const options: SignOptions = {
    algorithm: algorithm as Algorithm,
    header: {
      alg: algorithm as Algorithm,
      typ: "JWT"
    }
  };

  let jwtToken: string;
  try {
    if (algorithm.startsWith("PS") || algorithm.startsWith("RS") || algorithm.startsWith("ES")) {
      if (!pk) {
        return res.status(400).json({ error: "PrivateKey is required for the specified algorithm" });
      }
      jwtToken = jwt.sign(reformattedPayload, formatedKey as string, options);
    } else {
      if (!sk) {
        return res.status(400).json({ error: "SecretKey is required for the specified algorithm" });
      }
      jwtToken = jwt.sign(reformattedPayload, sk as string, options);
    }

    res.json({ token: jwtToken });
  } catch (err) {
    console.error("Error signing JWT:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


const formatPrivateKey = (key: string): string => {
  const cleanKey = key.replace(/\r?\n|\r/g, '').replace(/ /g, '');

  if (!cleanKey.startsWith('-----BEGINPRIVATEKEY-----') || !cleanKey.endsWith('-----ENDPRIVATEKEY-----')) {
    throw new Error("Invalid key format");
  }

  const base64Key = cleanKey
    .replace('-----BEGINPRIVATEKEY-----', '')
    .replace('-----ENDPRIVATEKEY-----', '');

  const formattedKey = `-----BEGIN PRIVATE KEY-----\n${base64Key.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----`;

  return formattedKey;
}


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
