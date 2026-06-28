import {
  AaveV3Arbitrum,
  AaveV3Avalanche,
  AaveV3Base,
  AaveV3BNB,
  AaveV3Ethereum,
  AaveV3EthereumEtherFi,
  AaveV3EthereumLido,
  AaveV3Gnosis,
  AaveV3Linea,
  AaveV3Optimism,
  AaveV3Plasma,
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

// CoW per-market ACLManager addresses. Only CoW flows do the on-chain lookup —
// Paraswap flows always have the user EOA as msg.sender to Pool.flashLoan, so
// they pay the default premium and don't need a check.
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
  [CustomMarket.proto_linea_v3]: AaveV3Linea.ACL_MANAGER,
  [CustomMarket.proto_plasma_v3]: AaveV3Plasma.ACL_MANAGER,
};

/**
 * Resolve the flashloan fee bps for the active swap.
 *
 * - CoW: msg.sender to Pool.flashLoan is the CoW factory. Check
 *   ACLManager.isFlashBorrower(factory) on chain. Returns 0 when whitelisted,
 *   FLASH_LOAN_FEE_BPS when not, and `undefined` while the query is pending or
 *   when we can't run the check (factory or ACLManager not mapped for the
 *   chain). Submit handlers MUST refuse to send while the value is undefined.
 * - Paraswap: msg.sender is always the user EOA, so the role can never apply.
 *   Returns the constant immediately, no on-chain call.
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
  const isCow = provider === SwapProvider.COW_PROTOCOL;
  const aclManager = ACL_MANAGER_BY_MARKET[marketData.market];
  const target = isCow
    ? ADAPTER_FACTORY[marketData.chainId as unknown as SupportedChainId] || undefined
    : undefined;

  const enabled = isCow && Boolean(aclManager && target);

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

  if (!isCow) {
    // Acknowledge swapType to keep the dep narrow even though Paraswap
    // doesn't branch on it for fee resolution.
    void swapType;
    return PARASWAP_FLASH_LOAN_FEE_BPS;
  }
  if (!enabled) return undefined;
  if (isWhitelisted === undefined) return undefined;
  return isWhitelisted ? 0 : FLASH_LOAN_FEE_BPS;
};
