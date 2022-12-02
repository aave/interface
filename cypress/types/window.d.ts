import { TenderlyFork } from '../cypress/support/tools/tenderly';
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Window {
    tenderly: TenderlyFork;
    address: string;
    chainId: string;
    rpc: string;
    market: string;
    testnetsEnabled:string;
    url:string;
    privateKey:string;
    provider:JsonRpcProvider
    signer: Wallet
    auth: Cypress.AUTWindow
  }
}
