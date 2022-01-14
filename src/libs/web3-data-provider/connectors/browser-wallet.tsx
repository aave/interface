import { ethers } from 'ethers';

declare global {
  // @ts-ignore
  interface WindowWithEthereum extends Window {
    ethereum?: ethers.providers.Web3Provider;
    web3?: ethers.providers.Web3Provider;
  }
}

const isEthereumObjectOnWindow = (global: WindowWithEthereum) =>
  global.ethereum && typeof global.ethereum === 'object';

export const getWeb3ProviderFromBrowser = (): ethers.providers.Web3Provider | undefined => {
  const global = window as WindowWithEthereum;
  return isEthereumObjectOnWindow(global) ? global.ethereum : global.web3 ? global.web3 : undefined;
};
