import { ApproveType, ERC20Service, LendingPoolBundle, PoolBundle } from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { Hashable } from 'src/utils/types';

export class ApprovedAmountService implements Hashable {
  private readonly ERC20Service: ERC20Service;
  private readonly PoolBundleService: PoolBundle | LendingPoolBundle;

  constructor(provider: Provider, public readonly currentMarketData: MarketDataType) {
    this.ERC20Service = new ERC20Service(provider);

    if (currentMarketData.v3) {
      this.PoolBundleService = new PoolBundle(provider, {
        POOL: currentMarketData.addresses.LENDING_POOL,
        WETH_GATEWAY: currentMarketData.addresses.WETH_GATEWAY,
        L2_ENCODER: currentMarketData.addresses.L2_ENCODER,
      });
    } else {
      this.PoolBundleService = new LendingPoolBundle(provider, {
        LENDING_POOL: currentMarketData.addresses.LENDING_POOL,
        WETH_GATEWAY: currentMarketData.addresses.WETH_GATEWAY,
      });
    }
  }

  async getPoolApprovedAmount(user: string, token: string): Promise<ApproveType> {
    if (this.PoolBundleService instanceof PoolBundle) {
      return this.PoolBundleService.supplyTxBuilder.getApprovedAmount({
        user,
        token,
      });
    } else {
      return this.PoolBundleService.depositTxBuilder.getApprovedAmount({
        user,
        token,
      });
    }
  }

  async getApprovedAmount(user: string, token: string, spender: string): Promise<number> {
    return this.ERC20Service.approvedAmount({
      user,
      token,
      spender,
    });
  }

  public toHash() {
    return this.currentMarketData.chainId.toString();
  }
}
