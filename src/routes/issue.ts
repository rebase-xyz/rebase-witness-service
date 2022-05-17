import axios from "axios";
import { Router, Request, Response } from "express";
import ethers from "ethers";
import * as didJWT from "did-jwt";
import { issueVC } from "../utils";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { rawGistUrl } = req.body;

  try {
    const response = await axios.get(rawGistUrl);
    const content = response.data;

    const { statement, signature } = content;

    const statementParts = (statement as string).split(" ");
    const githubHandle = statementParts[7];
    const did = statementParts[13];

    const address = did.split(":").pop();

    const reconstructedStatement = `I am attesting that this GitHub handle ${githubHandle} is linked to the DID ${did}`;

    const signer = ethers.utils.verifyMessage(
      reconstructedStatement,
      signature
    );

    const rawGistUrlParts = rawGistUrl.split("/");

    const gistPoster = rawGistUrlParts[3];

    if (
      gistPoster.toLowerCase() !== githubHandle.toLowerCase() ||
      address.toLowerCase() !== signer.toLowerCase()
    ) {
      return res.status(400).json({
        success: false,
        error: "Gist does not contain valid statement or signature",
      });
    }

    const gistId = rawGistUrlParts[4];
    const gistVersion = rawGistUrlParts[6];

    const jwt = await issueVC(did, githubHandle, gistId, gistVersion);
    const decodedJwt = didJWT.decodeJWT(jwt);

    return res.json({
      jwt,
      decodedJwt,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: error,
    });
  }
});

export default router;
