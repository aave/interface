import React from "react";
import ConnectWalletModal from "../components/ConnectWalletModal";
import { getSupportedChainIds } from "../helpers/config/markets-and-network-config";
import { Web3Provider } from "../libs/web3-data-provider";
import AppHeader from "./AppHeader";

/**
 * Main Layout component which wrapps around the whole app
 * @param param0
 * @returns
 */
export const MainLayout: React.FC = ({ children }) => {
  return (
    
      <>
        <AppHeader />
        <main>{children}</main>
      </>
  );
};
