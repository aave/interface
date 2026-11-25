import { evmAddress, useMigrationOpportunities } from '@aave/react';
import { Trans } from '@lingui/macro';
import { Box, Skeleton } from '@mui/material';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { AssetListGroup } from 'src/components/AssetListItem';
import { ChainIcon } from 'src/components/ChainIcon';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { EmptyStatePaper } from 'src/components/EmptyStatePaper';
import { FlowHeader } from 'src/components/FlowHeader';
import { NoSearchResults } from 'src/components/NoSearchResults';
import { SearchInput } from 'src/components/SearchInput';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { HUB_PICKER, MIGRATE_FLOW, searchEarnHubsPlaceholder } from '../utils/copy';
import { V4MigrationHubCard } from '../V4MigrationHubCard';
import { MIGRATION_MARKETS } from '../V4MigrationPage/utils/markets';
import { findEarnOpportunity, parsePositionId } from '../V4MigrationPage/utils/opportunities';
import { EarnHub, toEarnHubs } from './utils/hubs';

const LIST_SX = { display: 'flex', flexDirection: 'column', gap: '1.5rem' } as const;

const LOADING_CARDS = 3;

/** The earn migration flow, opened from a row of the migrate page's earn table. */
export const V4MigrationEarnFlow = () => {
  const router = useRouter();
  const { currentAccount } = useWeb3Context();
  const positionId = typeof router.query.position === 'string' ? router.query.position : undefined;
  const chainId = positionId ? parsePositionId(positionId)?.chainId : undefined;

  return (
    <>
      <FlowHeader
        title={MIGRATE_FLOW.title}
        subheading={
          chainId ? (
            MIGRATE_FLOW.selectHubSubheading(
              <span>
                <ChainIcon chainId={chainId} />
                <strong>{getNetworkConfig(chainId).name}</strong>
              </span>
            )
          ) : (
            <Skeleton
              variant="rectangular"
              width={370}
              height={17}
              sx={{ borderRadius: '0.5rem' }}
            />
          )
        }
      />
      {!router.isReady ? null : !currentAccount ? (
        <ConnectWalletPaper
          description={<Trans>Please connect your wallet to migrate your position.</Trans>}
        />
      ) : positionId && chainId ? (
        <SelectEarnHub user={currentAccount} positionId={positionId} chainId={chainId} />
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

const SelectEarnHub = ({
  user,
  positionId,
  chainId,
}: {
  user: string;
  positionId: string;
  chainId: number;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, error } = useMigrationOpportunities({
    markets: MIGRATION_MARKETS,
    user: evmAddress(user),
  });

  const hubs = useMemo(() => {
    const opportunity = data ? findEarnOpportunity(data, positionId) : undefined;
    return opportunity ? toEarnHubs(opportunity) : undefined;
  }, [data, positionId]);

  if (error) {
    return (
      <EmptyStatePaper
        title={<Trans>Something went wrong</Trans>}
        description={<Trans>We couldn&apos;t load the hubs. Please try again later.</Trans>}
      />
    );
  }

  if (!loading && !hubs) return <PositionNotFound />;

  const term = searchTerm.trim().toLowerCase();
  const matching = (hubs ?? []).filter((hub) => hub.name.toLowerCase().includes(term));
  const available = matching.filter((hub) => !hub.unavailable);
  const unavailable = matching.filter((hub) => hub.unavailable);

  // TODO: open the review step for the picked hub.
  const renderHub = (hub: EarnHub) => (
    <V4MigrationHubCard
      key={hub.id}
      chainId={chainId}
      hubName={hub.name}
      apy={hub.apy}
      apyAverage={hub.apyAverage}
      apyHistory={hub.apyHistory}
      hasIncentives={hub.hasIncentives}
      bestApy={hub.bestApy}
      unavailable={hub.unavailable}
      totalDepositsUSD={hub.totalDepositsUSD}
      backingCollateral={hub.backingCollateral}
    />
  );

  return (
    <Box sx={LIST_SX}>
      <SearchInput
        size="large"
        placeholder={searchEarnHubsPlaceholder()}
        onSearchTermChange={setSearchTerm}
        wrapperSx={{ width: '100%' }}
      />
      {loading ? (
        Array.from({ length: LOADING_CARDS }, (_, index) => (
          <V4MigrationHubCard
            key={index}
            loading
            chainId={chainId}
            hubName=""
            apy={0}
            totalDepositsUSD={0}
            backingCollateral={[]}
          />
        ))
      ) : matching.length === 0 ? (
        <NoSearchResults searchTerm={searchTerm} />
      ) : (
        <>
          {available.map(renderHub)}
          {unavailable.length > 0 && (
            <Box sx={{ pt: '1rem' }}>
              <AssetListGroup
                label={HUB_PICKER.unavailableHubs}
                tooltip={<Trans>Hubs this position can&apos;t be migrated to</Trans>}
              >
                <Box sx={{ ...LIST_SX, mt: '1.25rem' }}>{unavailable.map(renderHub)}</Box>
              </AssetListGroup>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};
