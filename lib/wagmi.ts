import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { Attribution } from "ox/erc8021";
import { coinbaseWallet } from "wagmi/connectors";

const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: [],  // BUILDER_CODE 暂不提供，预留位置
});

export const config = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: "Base Daily Check-in Badge",
      preference: "smartWalletOnly",
    }),
  ],
  transports: {
    [base.id]: http(),
  },
  dataSuffix: DATA_SUFFIX,
});