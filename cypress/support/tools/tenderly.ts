/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Contract, getDefaultProvider, providers, utils, Wallet } from 'ethers';

import ERC20_ABI from '../../fixtures/erc20_abi.json';

const TENDERLY_KEY = Cypress.env('TENDERLY_KEY');
const TENDERLY_ACCOUNT = Cypress.env('TENDERLY_ACCOUNT');
const TENDERLY_PROJECT = Cypress.env('TENDERLY_PROJECT');
const WALLET = Wallet.createRandom();

export const DEFAULT_TEST_ACCOUNT = {
  privateKey: WALLET.privateKey,
  address: WALLET.address.toLowerCase(),
};

const tenderlyFetch = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`https://api.tenderly.co/api/v1/${endpoint}`, {
    ...options,
    headers: {
      'X-Access-Key': TENDERLY_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`Tenderly API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

export class TenderlyVnet {
  public _vnetNetworkID: number;
  public _chainID: number;
  private _vnet_admin_rpc: string;
  private vnet_id?: string;

  constructor({ vnetNetworkID }: { vnetNetworkID: number }) {
    this._vnetNetworkID = vnetNetworkID;
    this._chainID = 3030;
    this._vnet_admin_rpc = '';
  }

  private checkVnetInitialized() {
    if (!this.vnet_id) throw new Error('Vnet not initialized!');
    if (this._vnet_admin_rpc == '')
      throw new Error('Vnet not initialized! Admin RPC url not found!');
  }

  async init() {
    const response = await tenderlyFetch(
      `account/${TENDERLY_ACCOUNT}/project/${TENDERLY_PROJECT}/vnets`,
      {
        method: 'POST',
        body: JSON.stringify({
          fork_config: {
            network_id: this._vnetNetworkID,
            block_number: 'latest',
          },
          virtual_network_config: {
            chain_config: { chain_id: this._chainID },
          },
        }),
      }
    );
    this.vnet_id = response.id;
    this._vnet_admin_rpc = response.rpcs.find(
      (rpc: { name: string }) => rpc.name === 'Admin RPC'
    )?.url;
  }

  get_rpc_url() {
    this.checkVnetInitialized();
    return this._vnet_admin_rpc;
  }

  async add_balance_rpc(address: string) {
    this.checkVnetInitialized();
    const response = await fetch(this.get_rpc_url(), {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tenderly_setBalance',
        params: [address, '0x21e19e0c9bab2400000'],
        id: '1234',
      }),
    });
    if (!response.ok) {
      throw new Error(`RPC error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async getERC20Token(
    walletAddress: string,
    tokenAddress: string,
    donorAddress?: string,
    tokenCount?: string,
    isAToken?: boolean
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

    if (isAToken) {
      await this.enableCollateralForAToken(walletAddress, tokenAddress);
    }
  }

  async enableCollateralForAToken(walletAddress: string, aTokenAddress: string) {
    const aTokenAbi = [
      'function UNDERLYING_ASSET_ADDRESS() view returns (address)',
      'function POOL() view returns (address)',
    ];
    const poolAbi = ['function setUserUseReserveAsCollateral(address asset, bool useAsCollateral)'];

    const rpcUrl = this.get_rpc_url();
    const provider = new providers.JsonRpcProvider(rpcUrl);

    const aToken = new Contract(aTokenAddress, aTokenAbi, provider);
    const underlyingAsset = await aToken.UNDERLYING_ASSET_ADDRESS();
    const poolAddress = await aToken.POOL();

    // @ts-ignore
    const walletSigner = provider.getSigner(walletAddress);
    const pool = new Contract(poolAddress, poolAbi, walletSigner);
    await pool.setUserUseReserveAsCollateral(underlyingAsset, true);
  }

  async getTopHolder(token: string) {
    const response = await fetch(
      `https://api.ethplorer.io/getTopTokenHolders/${token}?apiKey=freekey`
    );
    if (!response.ok) {
      throw new Error(`Ethplorer API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.holders[0].address;
  }

  async deleteVnet() {
    try {
      await tenderlyFetch(
        `account/${TENDERLY_ACCOUNT}/project/${TENDERLY_PROJECT}/vnets/${this.vnet_id}`,
        { method: 'DELETE' }
      );
    } catch (error) {}
  }
}
