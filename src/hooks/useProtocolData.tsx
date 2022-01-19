import { providers } from 'ethers';
import React, { PropsWithChildren, useContext, useEffect, useState } from 'react';

// import { BaseNetworkConfig } from "../ui-config/networksConfig";
import {
  availableMarkets,
  CustomMarket,
  getNetworkConfig,
  getProvider,
  MarketDataType,
  marketsData,
  NetworkConfig,
  networkConfigs as _networkConfigs,
} from '../utils/marketsAndNetworksConfig';

// /**
//  *
//  * @returns all the configured network + artifical networks for forks
//  */
// function getNetworkConfigsWithFork(): Record<string, BaseNetworkConfig> {
//   const FORK_BASE_CHAIN_ID = Number(
//     localStorage.getItem("forkBaseChainId") || 1
//   );
//   const FORK_CHAIN_ID = Number(localStorage.getItem("forkChainId") || 3030);
//   const FORK_RPC_URL =
//     localStorage.getItem("forkRPCUrl") || "http://127.0.0.1:8545";
//   const FORK_WS_RPC_URL =
//     localStorage.getItem("forkWsRPCUrl") || "ws://127.0.0.1:8545";

//   return {
//     ..._networkConfigs,
//     [FORK_CHAIN_ID]: {
//       ..._networkConfigs[FORK_BASE_CHAIN_ID],
//       rpcOnly: true,
//       isFork: true,
//       privateJsonRPCUrl: FORK_RPC_URL,
//       privateJsonRPCWSUrl: FORK_WS_RPC_URL,
//       underlyingChainId: FORK_BASE_CHAIN_ID,
//     },
//   };
// }

// /**
//  *
//  * @returns all possible markets + artifical markets for forks
//  */
// function getMarketsWithFork() {
//   const FORK_BASE_CHAIN_ID = Number(
//     localStorage.getItem("forkBaseChainId") || 1
//   );
//   const FORK_CHAIN_ID = Number(localStorage.getItem("forkChainId") || 3030);
//   const forkableMarkets = Object.entries(marketsData).filter(
//     ([key, value]) => value.chainId === FORK_BASE_CHAIN_ID
//   );
//   return {
//     ...marketsData,
//     ...forkableMarkets.reduce((acc, [key, value]) => {
//       acc[`fork_${key}`] = { ...value, chainId: FORK_CHAIN_ID };
//       return acc;
//     }, {} as { [key: string]: MarketDataType }),
//   };
// }

const LS_KEY = 'selectedMarket';

export interface ProtocolContextData {
  currentMarket: CustomMarket;
  setCurrentMarket: (market: CustomMarket) => void;
  currentMarketData: MarketDataType;
  // currently selected one
  currentChainId: number;
  currentNetworkConfig: NetworkConfig;
  jsonRpcProvider: providers.Provider;
}

const PoolDataContext = React.createContext({} as ProtocolContextData);

// eslint-disable-next-line @typescript-eslint/ban-types
export function ProtocolDataProvider({ children }: PropsWithChildren<{}>) {
  // const [markets, setMarkets] = useState(marketsData);
  // const [networkConfigs, setNetworkConfigs] = useState(_networkConfigs);
  const [currentMarket, setCurrentMarket] = useState<CustomMarket>(availableMarkets[0]);

  const currentMarketData = marketsData[currentMarket];

  const handleSetMarket = (market: CustomMarket) => {
    localStorage.setItem(LS_KEY, market);
    setCurrentMarket(market);
  };

  // set the last selected market onload
  useEffect(() => {
    const cachedMarket = localStorage.getItem(LS_KEY) as CustomMarket | undefined;
    if (cachedMarket && availableMarkets.includes(cachedMarket)) {
      setCurrentMarket(cachedMarket);
    }
  }, []);

  // set the available markets
  // useEffect(() => {
  //   const FORK_ENABLED = localStorage.getItem("forkEnabled") === "true";
  //   if (FORK_ENABLED) {
  //     const extendedNetworkConfigs = getNetworkConfigsWithFork();
  //     const markets = getMarketsWithFork();
  //     setNetworkConfigs(extendedNetworkConfigs);
  //     setMarkets(markets);
  //   }
  // }, []);

  return (
    <PoolDataContext.Provider
      value={{
        currentMarket,
        currentChainId: currentMarketData.chainId,
        setCurrentMarket: handleSetMarket,
        currentMarketData: currentMarketData,
        currentNetworkConfig: getNetworkConfig(currentMarketData.chainId),
        jsonRpcProvider: getProvider(currentMarketData.chainId),
      }}
    >
      {children}
    </PoolDataContext.Provider>
  );
}

export const useProtocolDataContext = () => useContext(PoolDataContext);
