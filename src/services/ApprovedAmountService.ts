import {
  ApproveType,
  ERC20Service,
  LendingPoolBundleInterface,
  PoolBundleInterface,
} from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { Hashable } from 'src/utils/types';

export class ApprovedAmountService implements Hashable {
  private readonly ERC20Service: ERC20Service;

  constructor(
    private bundle: PoolBundleInterface | LendingPoolBundleInterface,
    private currentMarketData: MarketDataType,
    provider: Provider
  ) {
    this.ERC20Service = new ERC20Service(provider);
  }

  async getPoolApprovedAmount(user: string, token: string): Promise<ApproveType> {
    if ('supplyTxBuilder' in this.bundle) {
      return this.bundle.supplyTxBuilder.getApprovedAmount({
        user,
        token,
      });
    } else {
      return this.bundle.depositTxBuilder.getApprovedAmount({
        user,
        token,
      });
    }
  }

  async getApprovedAmount(user: string, token: string, spender: string): Promise<ApproveType> {
    const amount = await this.ERC20Service.approvedAmount({
      user,
      token,
      spender,
    });

    return {
      user,
      token,
      spender,
      amount: amount.toString(),
    };
  }

  public toHash() {
    return this.currentMarketData.chainId.toString();
  }
}
