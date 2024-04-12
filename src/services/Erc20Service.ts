import { ERC20Service as DetailedERC20Service } from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import { BigNumber, Contract } from 'ethers';

import erc20Abi from '../libs/abis/erc20_abi.json';

export class ERC20Service {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private getERC20Service(chainId: number, token: string) {
    const provider = this.getProvider(chainId);
    return new Contract(token, erc20Abi, provider);
  }

  private getDetailedERC20Service(chainId: number) {
    const provider = this.getProvider(chainId);
    return new DetailedERC20Service(provider);
  }

  async getBalance(token: string, user: string, chainId: number) {
    const erc20Service = this.getERC20Service(chainId, token);
    const balance: BigNumber = erc20Service.balanceOf(user);
    return balance;
  }

  async getTokenInfo(token: string, chainId: number) {
    const detailedERC20Service = this.getDetailedERC20Service(chainId);
    return detailedERC20Service.getTokenData(token);
  }
}
