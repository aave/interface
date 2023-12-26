import { ChainId, WalletBalanceProvider } from '@aave/contract-helpers';
import { normalize } from '@aave/math-utils';
import { Provider } from '@ethersproject/providers';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
import { MarketDataType } from 'src/ui-config/marketsConfig';

export interface GovernanceTokensBalance {
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

  private getWalletBalanceService(chainId: ChainId, walletBalanceProviderAddress: string) {
    const provider = this.getProvider(chainId);
    return new WalletBalanceProvider({
      walletBalanceProviderAddress,
      provider,
    });
  }

  async getGovernanceTokensBalance(
    chainId: ChainId,
    walletBalanceProviderAddress: string,
    user: string
  ): Promise<GovernanceTokensBalance> {
    const walletBalanceService = this.getWalletBalanceService(
      chainId,
      walletBalanceProviderAddress
    );
    const balances = await walletBalanceService.batchBalanceOf(
      [user],
      [
        governanceV3Config.votingAssets.aaveTokenAddress,
        governanceV3Config.votingAssets.aAaveTokenAddress,
        governanceV3Config.votingAssets.stkAaveTokenAddress,
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
    const walletBalanceService = this.getWalletBalanceService(
      marketData.chainId,
      marketData.addresses.WALLET_BALANCE_PROVIDER
    );
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
}
