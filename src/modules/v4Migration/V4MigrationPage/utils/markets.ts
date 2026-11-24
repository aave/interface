import { chainId, evmAddress, MigrationOpportunitiesRequest } from '@aave/react';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { availableMarkets, marketsData } from 'src/utils/marketsAndNetworksConfig';

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

const v3Markets = availableMarkets
  .map((key) => marketsData[key as CustomMarket])
  .filter(
    (market) => market.v3 && !market.isFork && EVM_ADDRESS.test(market.addresses.LENDING_POOL)
  );

/** Every V3 market the interface lists, in the shape `migrationOpportunities` takes. */
export const MIGRATION_MARKETS: MigrationOpportunitiesRequest['markets'] = v3Markets.map(
  (market) => ({
    address: evmAddress(market.addresses.LENDING_POOL),
    chainId: chainId(market.chainId),
  })
);

const marketKey = (address: string, chain: number) => `${chain}:${address.toLowerCase()}`;

const titlesByMarket = new Map(
  v3Markets.map((market) => [
    marketKey(market.addresses.LENDING_POOL, market.chainId),
    market.marketTitle,
  ])
);

/** The interface's own name for a V3 market ("Core", "Prime"…), falling back to the API's. */
export const getMigrationMarketTitle = (market: {
  address: string;
  name: string;
  chain: { chainId: number };
}) => titlesByMarket.get(marketKey(market.address, market.chain.chainId)) ?? market.name;
