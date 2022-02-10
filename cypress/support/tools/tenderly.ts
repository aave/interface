/* eslint-disable @typescript-eslint/ban-ts-comment */
import axios from 'axios';
import { ethers } from 'ethers';
import ERC20_ABI from '../../fixtures/erc20_abi.json';

const TENDERLY_KEY = Cypress.env('TENDERLY_KEY');
const TENDERLY_ACCOUNT = Cypress.env('TENDERLY_ACCOUNT');
const TENDERLY_PROJECT = Cypress.env('TENDERLY_PROJECT');

export const DEFAULT_TEST_ACCOUNT = {
  privateKey: '0x54c6ae44611f38e662093c9a3f4b26c3bf13f5b8adb02da1a76f321bd18efe92',
  address: '0x56FB278a7191bdf7C5d493765Fec03E6EAdF72f1'.toLowerCase(),
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

  async getERC20Token(walletAddress: string, tokenAddress: string) {
    const _url = this.get_rpc_url();
    const provider = ethers.getDefaultProvider(_url);
    const TOP_HOLDER_ADDRESS = await this.getTopHolder(tokenAddress);
    // @ts-ignore
    const topHolderSigner = await provider.getSigner(TOP_HOLDER_ADDRESS);
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, topHolderSigner);
    await token.transfer(walletAddress, ethers.utils.parseEther('1000'));
  }

  async getTopHolder(token: string) {
    const res = (
      await axios.get(
        `https://ethplorer.io/service/service.php?data=${token}&page=tab%3Dtab-holders%26pageSize%3D10%26holders%3D1`
      )
    ).data.holders[0].address;
    return res;
  }

  async deleteFork() {
    await tenderly.delete(
      `account/${TENDERLY_ACCOUNT}/project/${TENDERLY_PROJECT}/fork/${this.fork_id}`
    );
  }
}
