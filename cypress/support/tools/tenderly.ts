import { TokenRequest } from '../actions/tenderly.actions';
import { Wallet } from 'ethers';

const TENDERLY_KEY = Cypress.env('TENDERLY_KEY');
const TENDERLY_ACCOUNT = Cypress.env('TENDERLY_ACCOUNT');
const TENDERLY_PROJECT = Cypress.env('TENDERLY_PROJECT');
const WALLET = Wallet.createRandom();

export const DEFAULT_TEST_ACCOUNT = {
  privateKey: WALLET.privateKey,
  address: WALLET.address.toLowerCase(),
};

const TENDERLY_BASE_URL = 'https://api.tenderly.co/api/v1/';

async function tenderlyFetch(path: string, options: RequestInit = {}) {
  const response = await fetch(`${TENDERLY_BASE_URL}${path}`, {
    ...options,
    headers: {
      'X-Access-Key': TENDERLY_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error(`Tenderly request failed: ${response.status}`);
  if (response.status === 204) return null;

  const responseText = await response.text();
  if (!responseText.trim()) return null;

  return JSON.parse(responseText);
}

async function adminRpcCall(rpcUrl: string, method: string, params: unknown[]) {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'content-type': 'text/plain' },
    body: JSON.stringify({ jsonrpc: '2.0', method, params, id: '1234' }),
  });
  const result = await response.json();
  if (result.error) throw new Error(`RPC error (${method}): ${result.error.message}`);
  return result;
}

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
    const data = await tenderlyFetch(
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
    this.vnet_id = data.id;
    this._vnet_admin_rpc = data.rpcs.find((rpc: { name: string }) => rpc.name === 'Admin RPC')?.url;
  }

  get_rpc_url() {
    this.checkVnetInitialized();
    return this._vnet_admin_rpc;
  }

  async add_balance_rpc(address: string) {
    this.checkVnetInitialized();
    return adminRpcCall(this.get_rpc_url(), 'tenderly_setBalance', [
      address,
      '0x21e19e0c9bab2400000',
    ]);
  }

  async getERC20Token(walletAddress: string, token: TokenRequest) {
    this.checkVnetInitialized();
    const { tokenAddress, tokenCount, underlyingAsset, poolAddress, autoSupply } = token;
    const amount = BigInt(tokenCount || '10') * BigInt(10) ** BigInt(18);
    const amountHex = '0x' + amount.toString(16);

    if (underlyingAsset && poolAddress) {
      // aToken: fund the underlying asset, then optionally supply to the pool
      await adminRpcCall(this.get_rpc_url(), 'tenderly_setErc20Balance', [
        underlyingAsset,
        [walletAddress],
        amountHex,
      ]);
      if (autoSupply) {
        await adminRpcCall(this.get_rpc_url(), 'eth_sendTransaction', [
          {
            from: walletAddress,
            to: underlyingAsset,
            // approve(address,uint256) — approve pool for the exact amount
            data:
              '0x095ea7b3' +
              poolAddress.toLowerCase().replace('0x', '').padStart(64, '0') +
              amount.toString(16).padStart(64, '0'),
            gas: '0x30000',
          },
        ]);
        await adminRpcCall(this.get_rpc_url(), 'eth_sendTransaction', [
          {
            from: walletAddress,
            to: poolAddress,
            // supply(address,uint256,address,uint16)
            data:
              '0x617ba037' +
              underlyingAsset.toLowerCase().replace('0x', '').padStart(64, '0') +
              amount.toString(16).padStart(64, '0') +
              walletAddress.toLowerCase().replace('0x', '').padStart(64, '0') +
              '0'.padStart(64, '0'),
            gas: '0x100000',
          },
        ]);
      }
    } else {
      // Regular ERC20: set balance directly
      await adminRpcCall(this.get_rpc_url(), 'tenderly_setErc20Balance', [
        tokenAddress,
        [walletAddress],
        amountHex,
      ]);
    }
  }

  async deleteVnet() {
    await tenderlyFetch(
      `account/${TENDERLY_ACCOUNT}/project/${TENDERLY_PROJECT}/vnets/${this.vnet_id}`,
      { method: 'DELETE' }
    );
  }
}
