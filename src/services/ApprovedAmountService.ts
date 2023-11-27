import { ApproveType, ERC20Service, LendingPoolBundle, PoolBundle } from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import { MarketDataType } from 'src/ui-config/marketsConfig';

export class ApprovedAmountService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private async getERC20Service(marketData: MarketDataType) {
    const provider = this.getProvider(marketData.chainId);
    return new ERC20Service(provider);
  }

  private async getPoolService(marketData: MarketDataType) {
    const provider = this.getProvider(marketData.chainId);
    return new PoolBundle(provider, {
      POOL: marketData.addresses.LENDING_POOL,
      WETH_GATEWAY: marketData.addresses.WETH_GATEWAY,
      L2_ENCODER: marketData.addresses.L2_ENCODER,
    });
  }

  private async getLendingPoolService(marketData: MarketDataType) {
    const provider = this.getProvider(marketData.chainId);
    return new LendingPoolBundle(provider, {
      LENDING_POOL: marketData.addresses.LENDING_POOL,
      WETH_GATEWAY: marketData.addresses.WETH_GATEWAY,
    });
  }

  async getPoolApprovedAmount(
    marketData: MarketDataType,
    user: string,
    token: string
  ): Promise<ApproveType> {
    if (marketData.v3) {
      const pool = await this.getPoolService(marketData);
      return pool.supplyTxBuilder.getApprovedAmount({
        user,
        token,
      });
    } else {
      const lendingPool = await this.getLendingPoolService(marketData);
      return lendingPool.depositTxBuilder.getApprovedAmount({ user, token });
    }
  }

  async getApprovedAmount(
    marketData: MarketDataType,
    user: string,
    token: string,
    spender: string
  ): Promise<number> {
    const service = await this.getERC20Service(marketData);
    return service.approvedAmount({
      user,
      token,
      spender,
    });
  }
}
