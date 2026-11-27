import { Trans } from '@lingui/macro';
import { Box, Skeleton } from '@mui/material';
import { useRouter } from 'next/router';
import { ReactNode, useMemo } from 'react';
import { ChainIcon } from 'src/components/ChainIcon';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { EmptyStatePaper } from 'src/components/EmptyStatePaper';
import { FlowHeader } from 'src/components/FlowHeader';
import { ROUTES } from 'src/components/primitives/Link';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { useMigrationOpportunities } from '../hooks/useMigrationApi';
import { MIGRATE_FLOW } from '../utils/copy';
import { getMigrationMarketTitle, MIGRATION_MARKETS } from '../V4MigrationPage/utils/markets';
import { findBorrowOpportunity, parsePositionId } from '../V4MigrationPage/utils/opportunities';
import { V4MigrationPositionSummary } from '../V4MigrationPositionSummary';
import { ReviewBorrowMigration } from './components/ReviewBorrowMigration';
import { SelectBorrowMarket } from './components/SelectBorrowMarket';
import { toBorrowMarkets } from './utils/markets';

const queryParam = (value: string | string[] | undefined) =>
  typeof value === 'string' ? value : undefined;

// The review step's table needs a wider column than the layout's, so that step grows past it by
// this much on each side where there is room.
const REVIEW_OVERHANG = '2.875rem';

const columnSx = (wide: boolean) =>
  ({
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    mx: wide ? { xs: 0, md: `-${REVIEW_OVERHANG}` } : 0,
  } as const);

/**
 * The borrow migration flow, opened from a row of the migrate page's borrow table. Both steps
 * live on one route: `position` names the V3 market — everything the user borrows there, and the
 * collateral behind it, moves together — and `market`, once picked, the V4 spoke it moves to.
 */
export const V4MigrationBorrowFlow = () => {
  const router = useRouter();
  const { currentAccount } = useWeb3Context();
  const positionId = queryParam(router.query.position);
  const marketId = queryParam(router.query.market);
  const chainId = positionId ? parsePositionId(positionId)?.chainId : undefined;

  let subheading: ReactNode = (
    <Skeleton variant="rectangular" width={370} height={17} sx={{ borderRadius: '0.5rem' }} />
  );
  if (chainId) {
    const chain = (
      <span>
        <ChainIcon chainId={chainId} />
        <strong>{getNetworkConfig(chainId).name}</strong>
      </span>
    );
    subheading = marketId
      ? MIGRATE_FLOW.reviewSubheading(chain)
      : MIGRATE_FLOW.selectHubSubheading(chain);
  }

  return (
    <Box sx={columnSx(!!marketId)}>
      <FlowHeader title={MIGRATE_FLOW.title} subheading={subheading} />
      {!router.isReady ? null : !currentAccount ? (
        <ConnectWalletPaper
          description={<Trans>Please connect your wallet to migrate your position.</Trans>}
        />
      ) : positionId && chainId ? (
        <BorrowFlowSteps
          user={currentAccount}
          positionId={positionId}
          chainId={chainId}
          marketId={marketId}
        />
      ) : (
        <PositionNotFound />
      )}
    </Box>
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
  marketId,
}: {
  user: string;
  positionId: string;
  chainId: number;
  marketId?: string;
}) => {
  const router = useRouter();
  const { data, loading, error } = useMigrationOpportunities({
    markets: MIGRATION_MARKETS,
    user: user,
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

  // A market that is not in the list, or that cannot take the position, falls back to the list.
  const market = marketId
    ? markets?.find((item) => item.id.toLowerCase() === marketId.toLowerCase() && !item.unavailable)
    : undefined;

  if (opportunity && market) {
    return <ReviewBorrowMigration user={user} opportunity={opportunity} market={market} />;
  }

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
      <SelectBorrowMarket
        chainId={chainId}
        markets={markets}
        onSelect={(picked) => router.push(ROUTES.migrationBorrowV4(positionId, picked.id))}
      />
    </>
  );
};
