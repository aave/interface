import { Box } from '@mui/material';
import { useState } from 'react';
import { AssetListGroup } from 'src/components/AssetListItem';
import { NoSearchResults } from 'src/components/NoSearchResults';
import { SearchInput } from 'src/components/SearchInput';

import { MARKET_PICKER, searchMarketsPlaceholder } from '../../../utils/copy';
import { V4MigrationHubCard } from '../../../V4MigrationHubCard';
import { BorrowMarket } from '../../utils/markets';

const LIST_SX = { display: 'flex', flexDirection: 'column', gap: '1.5rem' } as const;

const LOADING_CARDS = 3;

interface SelectBorrowMarketProps {
  chainId: number;
  /** Missing while the position is loading. */
  markets?: BorrowMarket[];
  /** Leave out while there is no next step to go to: the cards are then not clickable. */
  onSelect?: (market: BorrowMarket) => void;
}

/** First step of the borrow flow: the V4 markets the position can move to. */
export const SelectBorrowMarket = ({ chainId, markets, onSelect }: SelectBorrowMarketProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const term = searchTerm.trim().toLowerCase();
  const matching = (markets ?? []).filter((market) => market.name.toLowerCase().includes(term));
  const available = matching.filter((market) => !market.unavailable);
  const unavailable = matching.filter((market) => market.unavailable);

  const renderMarket = (market: BorrowMarket) => (
    <V4MigrationHubCard
      key={market.id}
      side="borrow"
      chainId={chainId}
      marketName={market.name}
      // The API does not say which hub a market draws from yet.
      hubName=""
      apy={market.apy}
      apyAverage={market.apyAverage}
      apyHistory={market.apyHistory}
      bestApy={market.best}
      unavailable={market.unavailable}
      healthFactor={market.healthFactor}
      onClick={market.unavailable || !onSelect ? undefined : () => onSelect(market)}
    />
  );

  return (
    <Box sx={LIST_SX}>
      <SearchInput
        size="large"
        placeholder={searchMarketsPlaceholder()}
        onSearchTermChange={setSearchTerm}
        wrapperSx={{ width: '100%' }}
      />
      {!markets ? (
        Array.from({ length: LOADING_CARDS }, (_, index) => (
          <V4MigrationHubCard
            key={index}
            loading
            side="borrow"
            chainId={chainId}
            marketName=""
            hubName=""
            apy={0}
          />
        ))
      ) : matching.length === 0 ? (
        <NoSearchResults searchTerm={searchTerm} />
      ) : (
        <>
          {available.map(renderMarket)}
          {unavailable.length > 0 && (
            <Box sx={{ pt: '1rem' }}>
              <AssetListGroup
                label={MARKET_PICKER.unavailableMarkets}
                tooltip={MARKET_PICKER.unavailableMarketsTooltip}
              >
                <Box sx={{ ...LIST_SX, mt: '1.25rem' }}>{unavailable.map(renderMarket)}</Box>
              </AssetListGroup>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};
