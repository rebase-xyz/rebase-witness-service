import request from "supertest";
import express from "express";
import KeyResolver from "@ceramicnetwork/key-did-resolver";
import { Resolver } from "did-resolver";
import * as didJWT from "did-jwt";
import issue from "../routes/issue";

const app = express();
app.use(express.json());
app.use("/issue", issue);

describe("Issuance Test", function () {
  test("Should not issue a credential if no gist Url is provided", async () => {
    const res = await request(app)
      .post("/issue")
      .set("Content-Type", "application/json")
      .send();
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("Should not issue a credential if gist does not contain expected data", async () => {
    const res = await request(app)
      .post("/issue")
      .set("Content-Type", "application/json")
      .send({
        rawGistUrl:
          "https://gist.githubusercontent.com/haardikk21/4005830542178141a762c109da5aa774/raw/19a23f2100bdfebfa541aaaa49522fdff1a08ab9/messageSchema.json",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  test("Should not issue a credential if gist contains invalid signature", async () => {
    const res = await request(app)
      .post("/issue")
      .set("Content-Type", "application/json")
      .send({
        rawGistUrl:
          "https://gist.githubusercontent.com/haardikk21/611eca912f6e589e11c736bcbd78499c/raw/a956e1fbaecfb4f4b2193b5ee70a842ca0478847/test-false.json",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  test.only("Should issue a credential if gist contains valid statement and signature", async () => {
    const res = await request(app)
      .post("/issue")
      .set("Content-Type", "application/json")
      .send({
        rawGistUrl:
          "https://gist.githubusercontent.com/haardikk21/e8b317f0d25ec5c6a9849022741a2032/raw/a0c970a18e536bd93768a899650601ba6bd6d155/test.json",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("jwt");
    expect(res.body).toHaveProperty("decodedJwt");

    const jwt = res.body.jwt;

    const verify = await didJWT.verifyJWT(jwt, {
      // @ts-ignore
      resolver: new Resolver({ ...KeyResolver.default.getResolver() }),
    });
    expect(verify).toBeTruthy();
  });
});
