import { evmAddress, useMigrationOpportunities } from '@aave/react';
import { Trans } from '@lingui/macro';
import { Skeleton } from '@mui/material';
import { useRouter } from 'next/router';
import { ReactNode, useMemo } from 'react';
import { ChainIcon } from 'src/components/ChainIcon';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { EmptyStatePaper } from 'src/components/EmptyStatePaper';
import { FlowHeader } from 'src/components/FlowHeader';
import { ROUTES } from 'src/components/primitives/Link';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { useV4SupplyReserves } from '../hooks/useV4Reserves';
import { MIGRATE_FLOW } from '../utils/copy';
import { MIGRATION_MARKETS } from '../V4MigrationPage/utils/markets';
import { findEarnOpportunity, parsePositionId } from '../V4MigrationPage/utils/opportunities';
import { ReviewEarnMigration } from './components/ReviewEarnMigration';
import { SelectEarnHub } from './components/SelectEarnHub';
import { toEarnHubs } from './utils/hubs';

const queryParam = (value: string | string[] | undefined) =>
  typeof value === 'string' ? value : undefined;

/**
 * The earn migration flow, opened from a row of the migrate page's earn table. Both steps live on
 * one route: `position` names the V3 supply, and `hub` — once picked — the V4 spoke it moves to.
 */
export const V4MigrationEarnFlow = () => {
  const router = useRouter();
  const { currentAccount } = useWeb3Context();
  const positionId = queryParam(router.query.position);
  const hubId = queryParam(router.query.hub);
  const chainId = positionId ? parsePositionId(positionId)?.chainId : undefined;

  const chain = chainId ? (
    <span>
      <ChainIcon chainId={chainId} />
      <strong>{getNetworkConfig(chainId).name}</strong>
    </span>
  ) : undefined;

  let subheading: ReactNode = (
    <Skeleton variant="rectangular" width={370} height={17} sx={{ borderRadius: '0.5rem' }} />
  );
  if (chain) {
    subheading = hubId
      ? MIGRATE_FLOW.reviewSubheading(chain)
      : MIGRATE_FLOW.selectHubSubheading(chain);
  }

  return (
    <>
      <FlowHeader title={MIGRATE_FLOW.title} subheading={subheading} />
      {!router.isReady ? null : !currentAccount ? (
        <ConnectWalletPaper
          description={<Trans>Please connect your wallet to migrate your position.</Trans>}
        />
      ) : positionId && chainId ? (
        <EarnFlowSteps
          user={currentAccount}
          positionId={positionId}
          chainId={chainId}
          hubId={hubId}
        />
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

const EarnFlowSteps = ({
  user,
  positionId,
  chainId,
  hubId,
}: {
  user: string;
  positionId: string;
  chainId: number;
  hubId?: string;
}) => {
  const router = useRouter();
  const { data, loading, error } = useMigrationOpportunities({
    markets: MIGRATION_MARKETS,
    user: evmAddress(user),
  });

  const opportunity = useMemo(
    () => (data ? findEarnOpportunity(data, positionId) : undefined),
    [data, positionId]
  );
  const supply = opportunity?.supplies[0];
  // The V4 API says which hub each spoke belongs to, so the hubs wait for it. If it fails they are
  // listed spoke by spoke, and the position can still be moved.
  const reserves = useV4SupplyReserves(chainId, supply?.currency.address);
  const hubs = useMemo(
    () => (opportunity && !reserves.isLoading ? toEarnHubs(opportunity, reserves.data) : undefined),
    [opportunity, reserves.isLoading, reserves.data]
  );

  if (error) {
    return (
      <EmptyStatePaper
        title={<Trans>Something went wrong</Trans>}
        description={<Trans>We couldn&apos;t load the hubs. Please try again later.</Trans>}
      />
    );
  }

  if (!loading && !opportunity) return <PositionNotFound />;

  // A hub that is not in the list, or that cannot take the position, falls back to the list.
  const hub = hubId
    ? hubs?.find((item) => item.id.toLowerCase() === hubId.toLowerCase() && !item.unavailable)
    : undefined;

  if (opportunity && supply && hub && hubs) {
    return (
      <ReviewEarnMigration
        user={user}
        opportunity={opportunity}
        supply={supply}
        hub={hub}
        hubs={hubs}
        // Replaced, so that going back still leads to the list of hubs.
        onChangeHub={(picked) => router.replace(ROUTES.migrationEarnV4(positionId, picked.id))}
      />
    );
  }

  return (
    <SelectEarnHub
      chainId={chainId}
      hubs={hubs}
      onSelect={(picked) => router.push(ROUTES.migrationEarnV4(positionId, picked.id))}
    />
  );
};
