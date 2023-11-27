import {
  ApproveType,
  IERC20ServiceInterface,
  LendingPoolBundleInterface,
  PoolBundleInterface,
} from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { Hashable } from 'src/utils/types';

export class ApprovedAmountService implements Hashable {
  private ERC20Service: IERC20ServiceInterface | undefined;
  private PoolService: PoolBundleInterface | undefined;
  private LendingPoolService: LendingPoolBundleInterface | undefined;

  constructor(private currentMarketData: MarketDataType, private provider: Provider) {}

  private async getERC20Service() {
    if (!this.ERC20Service) {
      this.ERC20Service = new (await import('@aave/contract-helpers')).ERC20Service(this.provider);
    }

    return this.ERC20Service;
  }

  private async getPoolService() {
    if (!this.PoolService) {
      this.PoolService = new (await import('@aave/contract-helpers')).PoolBundle(this.provider, {
        POOL: this.currentMarketData.addresses.LENDING_POOL,
        WETH_GATEWAY: this.currentMarketData.addresses.WETH_GATEWAY,
        L2_ENCODER: this.currentMarketData.addresses.L2_ENCODER,
      });
    }

    return this.PoolService;
  }

  private async getLendingPoolService() {
    if (!this.LendingPoolService) {
      this.LendingPoolService = new (await import('@aave/contract-helpers')).LendingPoolBundle(
        this.provider,
        {
          LENDING_POOL: this.currentMarketData.addresses.LENDING_POOL,
          WETH_GATEWAY: this.currentMarketData.addresses.WETH_GATEWAY,
        }
      );
    }

    return this.LendingPoolService;
  }

  async getPoolApprovedAmount(user: string, token: string): Promise<ApproveType> {
    if (this.currentMarketData.v3) {
      const pool = await this.getPoolService();
      return pool.supplyTxBuilder.getApprovedAmount({
        user,
        token,
      });
    } else {
      const lendingPool = await this.getLendingPoolService();
      return lendingPool.depositTxBuilder.getApprovedAmount({ user, token });
    }
  }

  async getApprovedAmount(user: string, token: string, spender: string): Promise<number> {
    const service = await this.getERC20Service();
    return service.approvedAmount({
      user,
      token,
      spender,
    });
  }

  public toHash() {
    return this.currentMarketData.chainId.toString();
  }
}
