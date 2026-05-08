import {
  AaveV3Arbitrum,
  AaveV3Avalanche,
  AaveV3Base,
  AaveV3BNB,
  AaveV3Ethereum,
  AaveV3EthereumEtherFi,
  AaveV3EthereumLido,
  AaveV3Gnosis,
  AaveV3Optimism,
  AaveV3Polygon,
  AaveV3Sonic,
} from '@aave-dao/aave-address-book';
import { SupportedChainId } from '@cowprotocol/cow-sdk';
import { useQuery } from '@tanstack/react-query';
import { Contract } from 'ethers';
import { CustomMarket, MarketDataType } from 'src/ui-config/marketsConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

import { ADAPTER_FACTORY, FLASH_LOAN_FEE_BPS } from '../constants/cow.constants';
import { PARASWAP_FLASH_LOAN_FEE_BPS } from '../constants/paraswap.constants';
import { SwapProvider, SwapType } from '../types';

const ACL_MANAGER_ABI = ['function isFlashBorrower(address) view returns (bool)'];

const ACL_MANAGER_BY_MARKET: Partial<Record<CustomMarket, string>> = {
  [CustomMarket.proto_mainnet_v3]: AaveV3Ethereum.ACL_MANAGER,
  [CustomMarket.proto_lido_v3]: AaveV3EthereumLido.ACL_MANAGER,
  [CustomMarket.proto_etherfi_v3]: AaveV3EthereumEtherFi.ACL_MANAGER,
  [CustomMarket.proto_arbitrum_v3]: AaveV3Arbitrum.ACL_MANAGER,
  [CustomMarket.proto_base_v3]: AaveV3Base.ACL_MANAGER,
  [CustomMarket.proto_polygon_v3]: AaveV3Polygon.ACL_MANAGER,
  [CustomMarket.proto_optimism_v3]: AaveV3Optimism.ACL_MANAGER,
  [CustomMarket.proto_avalanche_v3]: AaveV3Avalanche.ACL_MANAGER,
  [CustomMarket.proto_sonic_v3]: AaveV3Sonic.ACL_MANAGER,
  [CustomMarket.proto_gnosis_v3]: AaveV3Gnosis.ACL_MANAGER,
  [CustomMarket.proto_bnb_v3]: AaveV3BNB.ACL_MANAGER,
};

const fallbackBps = (provider: SwapProvider): number =>
  provider === SwapProvider.COW_PROTOCOL ? FLASH_LOAN_FEE_BPS : PARASWAP_FLASH_LOAN_FEE_BPS;

const resolveTarget = (
  provider: SwapProvider,
  swapType: SwapType,
  marketData: MarketDataType
): string | undefined => {
  if (provider === SwapProvider.COW_PROTOCOL) {
    return ADAPTER_FACTORY[marketData.chainId as unknown as SupportedChainId] || undefined;
  }
  if (provider === SwapProvider.PARASWAP) {
    switch (swapType) {
      case SwapType.CollateralSwap:
        return marketData.addresses.SWAP_COLLATERAL_ADAPTER;
      case SwapType.RepayWithCollateral:
        return marketData.addresses.REPAY_WITH_COLLATERAL_ADAPTER;
      case SwapType.DebtSwap:
        return marketData.addresses.DEBT_SWITCH_ADAPTER;
      case SwapType.WithdrawAndSwap:
        return marketData.addresses.WITHDRAW_SWITCH_ADAPTER;
      default:
        return undefined;
    }
  }
  return undefined;
};

/**
 * Resolve the flashloan fee bps for the active swap by checking the market's
 * ACLManager.isFlashBorrower for the provider's target address. Returns 0 when
 * the target is whitelisted, the provider's default bps when it's not, and
 * `undefined` whenever we don't have an on-chain answer (query pending,
 * ACLManager unmapped for the market, or no target address resolvable). The
 * caller MUST refuse to submit a transaction while the value is undefined.
 */
export const useFlashLoanFeeBps = ({
  provider,
  swapType,
  marketData,
}: {
  provider: SwapProvider;
  swapType: SwapType;
  marketData: MarketDataType;
}): number | undefined => {
  const aclManager = ACL_MANAGER_BY_MARKET[marketData.market];
  const target = resolveTarget(provider, swapType, marketData);
  const defaultBps = fallbackBps(provider);

  const enabled = Boolean(aclManager && target);

  const { data: isWhitelisted } = useQuery({
    queryFn: async (): Promise<boolean> => {
      const contract = new Contract(
        aclManager as string,
        ACL_MANAGER_ABI,
        getProvider(marketData.chainId)
      );
      return contract.isFlashBorrower(target);
    },
    queryKey: ['flashBorrowerCheck', marketData.chainId, aclManager, target],
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  if (!enabled) return undefined;
  if (isWhitelisted === undefined) return undefined;
  return isWhitelisted ? 0 : defaultBps;
};
