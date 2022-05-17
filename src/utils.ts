import { generateKeyPairFromSeed } from "@stablelib/ed25519";
import { randomBytes } from "crypto";
import * as didJWT from "did-jwt";
import { encodeDID } from "key-did-provider-ed25519";

export async function issueVC(
  did: string,
  githubHandle: string,
  gistId: string,
  gistVersion: string
) {
  const seed = new Uint8Array(randomBytes(32));
  const { secretKey, publicKey } = generateKeyPairFromSeed(seed);
  const iss = encodeDID(publicKey);
  const signer = didJWT.EdDSASigner(secretKey);

  const jwt = await didJWT.createJWT(
    {
      sub: did,
      nbf: Math.floor(Date.now() / 1000),
      vc: {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          {
            sameAs: "https://schema.org/sameAs",
            GitHubVerification: {
              "@id": "https://tzprofiles.com/GithubVerification",
              "@context": {
                "@version": 1.1,
                "@protected": true,
                url: "https://schema.org/URL",
              },
            },
            GitHubVerificationMessage: {
              "@id": "https://tzprofiles.com/GitHubVerificationMessage",
              "@context": {
                "@version": 1.1,
                "@protected": true,
                timestamp: {
                  "@id": "https://tzprofiles.com/timestamp",
                  "@type": "https://www.w3.org/2001/XMLSchema#dateTime",
                },
                gistId: "https://tzprofiles.com/gistId",
                gistVersion: "https://tzprofiles.com/gistVersion",
                handle: "https://tzprofiles.com/handle",
              },
            },
          },
        ],
        evidence: {
          type: ["GithubVerificationMessage"],
          handle: githubHandle,
          gistVersion: gistVersion,
          gistId: gistId,
          timestamp: new Date().toISOString(),
        },
        issuanceDate: new Date().toISOString(),
        id: "in24r23kasdal3423432r",
        type: ["VerifiableCredential", "GitHubVerification"],
        credentialSubject: {
          id: did,
          sameAs: `https://github.com/${githubHandle}`,
        },
        issuer: iss,
      },
    },
    {
      issuer: iss,
      signer,
    },
    {
      alg: "EdDSA",
    }
  );

  return jwt;
}
