import express, { Request, Response } from "express";
import jwt, { SignOptions, Algorithm } from "jsonwebtoken";
import cors from "cors";
import { urlWhitelistMiddleware } from "./whitelistMiddleware";

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(urlWhitelistMiddleware);

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
      jwtToken = jwt.sign(reformattedPayload, pk as string, options);
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

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
