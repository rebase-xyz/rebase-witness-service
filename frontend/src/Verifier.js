import { useAccount, useSignMessage } from "wagmi";
import KeyResolver from "@ceramicnetwork/key-did-resolver";
import { Resolver } from "did-resolver";
import * as didJWT from "did-jwt";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRef, useState } from "react";
import axios from "axios";

function Verifier() {
  const { data } = useAccount();
  const signature = useRef();
  const { signMessage } = useSignMessage({
    onSuccess(data, variables) {
      signature.current = data;
      generateGistContents();
    },
  });
  const [githubHandle, setGithubHandle] = useState("");
  const [gistContents, setGistContents] = useState("");
  const [rawGistUrl, setRawGistUrl] = useState("");
  const [vcResponse, setVcResponse] = useState();
  const [verifyResponse, setVerifyResponse] = useState();

  function signStatement() {
    const message = `I am attesting that this GitHub handle ${githubHandle} is linked to the DID did:pkh:eip155:1:${data.address}`;
    signMessage({ message });
  }

  function generateGistContents() {
    const content = {
      statement: `I am attesting that this GitHub handle ${githubHandle} is linked to the DID did:pkh:eip155:1:${data.address}`,
      signature: signature.current,
    };

    setGistContents(JSON.stringify(content, null, 2));
  }

  async function issueVC() {
    const response = await axios.post("http://localhost:4000/issue", {
      rawGistUrl,
    });
    setVcResponse(response.data);
  }

  async function verifyVC(jwt) {
    const verify = await didJWT.verifyJWT(jwt, {
      // @ts-ignore
      resolver: new Resolver({ ...KeyResolver.getResolver() }),
    });
    setVerifyResponse(verify);
  }

  return (
    <div>
      <ConnectButton />

      {data != null && (
        <>
          <h3>Step 1. Enter your github handle, and sign using Metamask</h3>
          <input
            type="text"
            placeholder="Github Handle"
            onChange={(e) => setGithubHandle(e.target.value)}
          />

          <button onClick={signStatement}>Sign</button>

          <h3>
            Step 2. Copy-paste this content and create a Github Gist, grab the
            Raw URL
          </h3>
          <textarea cols={80} rows={20} readOnly value={gistContents} />

          <h3>
            Step 3. Enter the raw gist url and click submit to get your VC
          </h3>
          <input type="text" onChange={(e) => setRawGistUrl(e.target.value)} />
          <button onClick={issueVC}>Submit</button>

          <div style={{ flexDirection: "row", rowGap: 10 }}>
            <textarea cols={80} rows={20} readOnly value={vcResponse?.jwt} />
            <textarea
              cols={80}
              rows={20}
              readOnly
              value={JSON.stringify(vcResponse?.decodedJwt, null, 2)}
            />
          </div>

          <h3>Step 4. Verify your VC (client-side)</h3>
          <button onClick={() => verifyVC(vcResponse?.jwt)}>Verify</button>
          <br />
          <textarea
            cols={80}
            rows={20}
            readOnly
            value={JSON.stringify(verifyResponse, null, 2)}
          />
        </>
      )}
    </div>
  );
}

export default Verifier;
