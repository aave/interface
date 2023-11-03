import { BatchBalanceOfResponse, WalletBalanceProvider } from '@aave/contract-helpers';
import { normalize } from '@aave/math-utils';
import { Provider } from '@ethersproject/providers';
import { governanceConfig } from 'src/ui-config/governanceConfig';
import { MarketDataType } from 'src/ui-config/marketsConfig';

interface GovernanceTokensBalance {
  aave: string;
  stkAave: string;
  aAave: string;
}

export type UserPoolTokensBalances = {
  address: string;
  amount: string;
};

export class WalletBalanceService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private getWalletBalanceService(marketData: MarketDataType) {
    const provider = this.getProvider(marketData.chainId);
    return new WalletBalanceProvider({
      walletBalanceProviderAddress: marketData.addresses.WALLET_BALANCE_PROVIDER,
      provider,
    });
  }

  async getGovernanceTokensBalance(
    marketData: MarketDataType,
    user: string
  ): Promise<GovernanceTokensBalance> {
    const walletBalanceService = this.getWalletBalanceService(marketData);
    const balances = await walletBalanceService.batchBalanceOf(
      [user],
      [
        governanceConfig.aaveTokenAddress,
        governanceConfig.aAaveTokenAddress,
        governanceConfig.stkAaveTokenAddress,
      ]
    );
    return {
      aave: normalize(balances[0].toString(), 18),
      aAave: normalize(balances[1].toString(), 18),
      stkAave: normalize(balances[2].toString(), 18),
    };
  }

  async getPoolTokensBalances(
    marketData: MarketDataType,
    user: string
  ): Promise<UserPoolTokensBalances[]> {
    const walletBalanceService = this.getWalletBalanceService(marketData);
    const { 0: tokenAddresses, 1: balances } =
      await walletBalanceService.getUserWalletBalancesForLendingPoolProvider(
        user,
        marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER
      );
    const mappedBalances = tokenAddresses.map((address, ix) => ({
      address: address.toLowerCase(),
      amount: balances[ix].toString(),
    }));
    return mappedBalances;
  }

  async getWrappedTokenInBalances(
    tokenInAddresses: string[],
    marketData: MarketDataType,
    user: string
  ): Promise<BatchBalanceOfResponse> {
    console.log('token in', tokenInAddresses);
    const walletBalanceService = this.getWalletBalanceService(marketData);
    const balances = await walletBalanceService.batchBalanceOf([user], tokenInAddresses);
    console.log('balances', balances);
    return balances;
  }
}
