import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import { useState } from 'react';
import { AssetListGroup } from 'src/components/AssetListItem';
import { EmptyStatePaper } from 'src/components/EmptyStatePaper';
import { NoSearchResults } from 'src/components/NoSearchResults';
import { SearchInput } from 'src/components/SearchInput';

import { useV4SupplyApyHistory } from '../../../hooks/useV4Reserves';
import { HUB_PICKER, searchEarnHubsPlaceholder } from '../../../utils/copy';
import { V4MigrationHubCard } from '../../../V4MigrationHubCard';
import { EarnHub } from '../../utils/hubs';

const LIST_SX = { display: 'flex', flexDirection: 'column', gap: '1.5rem' } as const;

const LOADING_CARDS = 3;

const EarnHubCard = ({
  chainId,
  hub,
  onSelect,
}: {
  chainId: number;
  hub: EarnHub;
  onSelect: (hub: EarnHub) => void;
}) => {
  const { reserve } = hub;
  const history = useV4SupplyApyHistory(reserve?.id);

  return (
    <V4MigrationHubCard
      chainId={chainId}
      hubName={hub.name}
      curators={reserve?.curator ? [reserve.curator] : undefined}
      apy={hub.apy}
      apyAverage={reserve?.supplyApyAverage}
      apyHistory={history.data}
      historyLoading={history.isLoading}
      hasIncentives={reserve?.hasIncentives}
      bestApy={hub.bestApy}
      unavailable={hub.unavailable}
      totalDepositsUSD={reserve?.suppliedUSD}
      backingCollateral={reserve?.exposure}
      onClick={hub.unavailable ? undefined : () => onSelect(hub)}
    />
  );
};

interface SelectEarnHubProps {
  chainId: number;
  /** Missing while the position is loading. */
  hubs?: EarnHub[];
  onSelect: (hub: EarnHub) => void;
}

/** First step of the earn flow: the V4 hubs the position can move to. */
export const SelectEarnHub = ({ chainId, hubs, onSelect }: SelectEarnHubProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const term = searchTerm.trim().toLowerCase();
  const matching = (hubs ?? []).filter((hub) => hub.name.toLowerCase().includes(term));
  const available = matching.filter((hub) => !hub.unavailable);
  const unavailable = matching.filter((hub) => hub.unavailable);

  const renderHub = (hub: EarnHub) => (
    <EarnHubCard key={hub.id} chainId={chainId} hub={hub} onSelect={onSelect} />
  );

  return (
    <Box sx={LIST_SX}>
      <SearchInput
        size="large"
        placeholder={searchEarnHubsPlaceholder()}
        onSearchTermChange={setSearchTerm}
        wrapperSx={{ width: '100%' }}
      />
      {!hubs ? (
        Array.from({ length: LOADING_CARDS }, (_, index) => (
          <V4MigrationHubCard key={index} loading chainId={chainId} hubName="" apy={0} />
        ))
      ) : hubs.length === 0 ? (
        <EmptyStatePaper
          title={<Trans>No hubs for this asset</Trans>}
          description={<Trans>No Aave V4 hub lists this asset yet.</Trans>}
        />
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
