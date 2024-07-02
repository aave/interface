import { GhoService } from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { GHO_MINTING_MARKETS } from 'src/utils/ghoUtilities';
import invariant from 'tiny-invariant';

export class UiGhoService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private getUiGhoProvider(marketData: MarketDataType) {
    const provider = this.getProvider(marketData.chainId);
    const isGhoSupportedMintingMarket = GHO_MINTING_MARKETS.includes(marketData.market);
    invariant(isGhoSupportedMintingMarket, 'GHO minting is not supported in this market');
    const { GHO_TOKEN_ADDRESS: ghoTokenAddress, GHO_UI_DATA_PROVIDER: uiGhoDataProviderAddress } =
      marketData.addresses;
    invariant(
      ghoTokenAddress && uiGhoDataProviderAddress,
      'Gho token address or UI Gho data provider address not found for this market'
    );
    return new GhoService({
      provider,
      uiGhoDataProviderAddress: uiGhoDataProviderAddress,
    });
  }

  async getGhoReserveData(marketData: MarketDataType) {
    const uiGhoProvider = this.getUiGhoProvider(marketData);
    return uiGhoProvider.getGhoReserveData();
  }
  async getGhoUserData(marketData: MarketDataType, user: string) {
    const uiGhoProvider = this.getUiGhoProvider(marketData);
    return uiGhoProvider.getGhoUserData(user);
  }
}
