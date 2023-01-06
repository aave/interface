/* eslint-disable @typescript-eslint/ban-ts-comment */
import { JsonRpcProvider } from '@ethersproject/providers';
import axios from 'axios';
import { Contract, getDefaultProvider, utils, Wallet } from 'ethers';

import ERC20_ABI from '../../fixtures/erc20_abi.json';
import POOL_CONFIG_ABI from '../../fixtures/poolConfig.json';

const TENDERLY_KEY = Cypress.env('TENDERLY_KEY');
const TENDERLY_ACCOUNT = Cypress.env('TENDERLY_ACCOUNT');
const TENDERLY_PROJECT = Cypress.env('TENDERLY_PROJECT');
const WALLET = Wallet.createRandom();

export const DEFAULT_TEST_ACCOUNT = {
  privateKey: WALLET.privateKey,
  address: WALLET.address.toLowerCase(),
};

const tenderly = axios.create({
  baseURL: 'https://api.tenderly.co/api/v1/',
  headers: {
    'X-Access-Key': TENDERLY_KEY,
  },
});

export class TenderlyFork {
  public _forkNetworkID: string;
  public _chainID: number;
  private fork_id?: string;

  constructor({ forkNetworkID }: { forkNetworkID: number }) {
    this._forkNetworkID = forkNetworkID.toString();
    this._chainID = 3030;
  }

  async init() {
    const response = await tenderly.post(
      `account/${TENDERLY_ACCOUNT}/project/${TENDERLY_PROJECT}/fork`,
      {
        network_id: this._forkNetworkID,
        chain_config: { chain_id: this._chainID },
      }
    );
    this.fork_id = response.data.simulation_fork.id;
  }

  get_rpc_url() {
    if (!this.fork_id) throw new Error('Fork not initialized!');
    return `https://rpc.tenderly.co/fork/${this.fork_id}`;
  }

  async add_balance(address: string, amount: number) {
    if (!this.fork_id) throw new Error('Fork not initialized!');
    tenderly.post(
      `account/${TENDERLY_ACCOUNT}/project/${TENDERLY_PROJECT}/fork/${this.fork_id}/balance`,
      { accounts: [address], amount: amount }
    );
  }

  async add_balance_rpc(address: string) {
    if (!this.fork_id) throw new Error('Fork not initialized!');
    axios({
      url: this.get_rpc_url(),
      method: 'post',
      headers: { 'content-type': 'text/plain' },
      data: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tenderly_setBalance',
        params: [address, '0x21e19e0c9bab2400000'],
        id: '1234',
      }),
    });
  }

  async unpauseMarket(): Promise<void> {
    const _url = this.get_rpc_url();
    const provider = new JsonRpcProvider(_url);
    const emergencyAdmin = '0x4365F8e70CF38C6cA67DE41448508F2da8825500';
    const signer = await provider.getSigner(emergencyAdmin);
    // constant addresses:

    const poolConfigurator = new Contract(
      '0x8145eddDf43f50276641b55bd3AD95944510021E',
      POOL_CONFIG_ABI,
      signer
    );

    await poolConfigurator.setPoolPause(false, { from: signer._address, gasLimit: '4000000' });
    return;
  }

  async getERC20Token(
    walletAddress: string,
    tokenAddress: string,
    donorAddress?: string,
    tokenCount?: string
  ) {
    cy.log('walletAddress ' + walletAddress);
    cy.log('tokenAddress ' + tokenAddress);
    cy.log('donorAddress ' + donorAddress);
    cy.log('tokenCount ' + tokenCount);
    let TOP_HOLDER_ADDRESS;
    const _url = this.get_rpc_url();
    const provider = getDefaultProvider(_url);
    if (donorAddress) {
      TOP_HOLDER_ADDRESS = donorAddress;
    } else {
      TOP_HOLDER_ADDRESS = await this.getTopHolder(tokenAddress);
    }
    // @ts-ignore
    const topHolderSigner = await provider.getSigner(TOP_HOLDER_ADDRESS);
    const token = new Contract(tokenAddress, ERC20_ABI, topHolderSigner);
    await token.transfer(walletAddress, utils.parseEther(tokenCount || '10'));
  }

  async getTopHolder(token: string) {
    const res = (
      await axios.get(`https://api.ethplorer.io/getTopTokenHolders/${token}?apiKey=freekey`)
    ).data.holders[0].address;
    return res;
  }

  async deleteFork() {
    await tenderly.delete(
      `account/${TENDERLY_ACCOUNT}/project/${TENDERLY_PROJECT}/fork/${this.fork_id}`
    );
  }
}
