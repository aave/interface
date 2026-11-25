import { evmAddress, useMigrationOpportunities } from '@aave/react';
import { Trans } from '@lingui/macro';
import { Skeleton } from '@mui/material';
import { useRouter } from 'next/router';
import { ReactNode, useMemo } from 'react';
import { ChainIcon } from 'src/components/ChainIcon';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { EmptyStatePaper } from 'src/components/EmptyStatePaper';
import { FlowHeader } from 'src/components/FlowHeader';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { MIGRATE_FLOW } from '../utils/copy';
import { getMigrationMarketTitle, MIGRATION_MARKETS } from '../V4MigrationPage/utils/markets';
import { findBorrowOpportunity, parsePositionId } from '../V4MigrationPage/utils/opportunities';
import { V4MigrationPositionSummary } from '../V4MigrationPositionSummary';
import { SelectBorrowMarket } from './components/SelectBorrowMarket';
import { toBorrowMarkets } from './utils/markets';

const queryParam = (value: string | string[] | undefined) =>
  typeof value === 'string' ? value : undefined;

/**
 * The borrow migration flow, opened from a row of the migrate page's borrow table. `position`
 * names the V3 market: everything the user borrows there, and the collateral behind it, moves
 * together.
 */
export const V4MigrationBorrowFlow = () => {
  const router = useRouter();
  const { currentAccount } = useWeb3Context();
  const positionId = queryParam(router.query.position);
  const chainId = positionId ? parsePositionId(positionId)?.chainId : undefined;

  let subheading: ReactNode = (
    <Skeleton variant="rectangular" width={370} height={17} sx={{ borderRadius: '0.5rem' }} />
  );
  if (chainId) {
    subheading = MIGRATE_FLOW.selectHubSubheading(
      <span>
        <ChainIcon chainId={chainId} />
        <strong>{getNetworkConfig(chainId).name}</strong>
      </span>
    );
  }

  return (
    <>
      <FlowHeader title={MIGRATE_FLOW.title} subheading={subheading} />
      {!router.isReady ? null : !currentAccount ? (
        <ConnectWalletPaper
          description={<Trans>Please connect your wallet to migrate your position.</Trans>}
        />
      ) : positionId && chainId ? (
        <BorrowFlowSteps user={currentAccount} positionId={positionId} chainId={chainId} />
      ) : (
        <PositionNotFound />
      )}
    </>
  );
};

const PositionNotFound = () => (
  <EmptyStatePaper
    title={<Trans>Position not found</Trans>}
    description={<Trans>Go back to the migrate page and pick a position to move.</Trans>}
  />
);

const BorrowFlowSteps = ({
  user,
  positionId,
  chainId,
}: {
  user: string;
  positionId: string;
  chainId: number;
}) => {
  const { data, loading, error } = useMigrationOpportunities({
    markets: MIGRATION_MARKETS,
    user: evmAddress(user),
  });

  const opportunity = useMemo(
    () => (data ? findBorrowOpportunity(data, positionId) : undefined),
    [data, positionId]
  );
  const markets = useMemo(
    () => (opportunity ? toBorrowMarkets(opportunity) : undefined),
    [opportunity]
  );

  if (error) {
    return (
      <EmptyStatePaper
        title={<Trans>Something went wrong</Trans>}
        description={<Trans>We couldn&apos;t load the markets. Please try again later.</Trans>}
      />
    );
  }

  if (!loading && !opportunity) return <PositionNotFound />;

  return (
    <>
      <V4MigrationPositionSummary
        chainId={chainId}
        marketName={opportunity ? getMigrationMarketTitle(opportunity.market) : ''}
        balanceUSD={Number(opportunity?.netBalanceUsd ?? 0)}
        apy={Number(opportunity?.apy?.value ?? 0)}
        healthFactor={opportunity?.healthFactor ?? '-1'}
        loading={!opportunity}
      />
      {/* TODO: pass `onSelect` once the review step exists. */}
      <SelectBorrowMarket chainId={chainId} markets={markets} />
    </>
  );
};
