import {
  apiProvider,
  configureChains,
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { chain, createClient, WagmiProvider } from "wagmi";
import "./App.css";
import Verifier from "./Verifier";

const { chains, provider } = configureChains(
  [chain.mainnet, chain.rinkeby],
  [apiProvider.fallback()]
);

const { connectors } = getDefaultWallets({
  appName: "Github Verifier",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function App() {
  return (
    <div className="App">
      <WagmiProvider client={wagmiClient}>
        <RainbowKitProvider chains={chains}>
          <Verifier />
        </RainbowKitProvider>
      </WagmiProvider>
    </div>
  );
}

export default App;
