import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import { useState } from 'react';
import { AssetListGroup } from 'src/components/AssetListItem';
import { NoSearchResults } from 'src/components/NoSearchResults';
import { SearchInput } from 'src/components/SearchInput';

import { HUB_PICKER, searchEarnHubsPlaceholder } from '../../../utils/copy';
import { V4MigrationHubCard } from '../../../V4MigrationHubCard';
import { EarnHub } from '../../utils/hubs';

const LIST_SX = { display: 'flex', flexDirection: 'column', gap: '1.5rem' } as const;

const LOADING_CARDS = 3;

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
      onClick={hub.unavailable ? undefined : () => onSelect(hub)}
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
      {!hubs ? (
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
