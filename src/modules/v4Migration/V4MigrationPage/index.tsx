import { t, Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import { useState } from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { NoSearchResults } from 'src/components/NoSearchResults';
import { PageHeader } from 'src/components/PageHeader/PageHeader';
import { ROUTES } from 'src/components/primitives/Link';
import { SearchInput } from 'src/components/SearchInput';

import { BorrowPositionsTable } from './components/BorrowPositionsTable';
import { EarnPositionsTable } from './components/EarnPositionsTable';
import { assetMatchesSearch } from './utils/positions';
import { BorrowMigrationPosition, EarnMigrationPosition } from './utils/types';

interface V4MigrationPageProps {
  earnPositions: EarnMigrationPosition[];
  borrowPositions: BorrowMigrationPosition[];
  onMigrateEarn?: (position: EarnMigrationPosition) => void;
  onMigrateBorrow?: (position: BorrowMigrationPosition) => void;
}

export const V4MigrationPage = ({
  earnPositions,
  borrowPositions,
  onMigrateEarn,
  onMigrateBorrow,
}: V4MigrationPageProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const visibleEarnPositions = earnPositions.filter((position) =>
    assetMatchesSearch(position.asset, searchTerm)
  );
  const visibleBorrowPositions = borrowPositions.filter((position) =>
    [...position.collateral, ...position.borrowed].some((asset) =>
      assetMatchesSearch(asset, searchTerm)
    )
  );
  const noSearchResults =
    !!searchTerm && visibleEarnPositions.length === 0 && visibleBorrowPositions.length === 0;

  return (
    <>
      <PageHeader
        backHref={ROUTES.dashboard}
        title={<Trans>Migrate</Trans>}
        description={<Trans>Choose which positions to migrate into Aave V4.</Trans>}
      />
      <ContentContainer>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <SearchInput
            placeholder={t`Search asset name, symbol, or address`}
            onSearchTermChange={setSearchTerm}
            wrapperSx={{ width: { xs: '100%', sm: '320px' } }}
          />
          {visibleEarnPositions.length > 0 && (
            <EarnPositionsTable positions={visibleEarnPositions} onMigrate={onMigrateEarn} />
          )}
          {visibleBorrowPositions.length > 0 && (
            <BorrowPositionsTable positions={visibleBorrowPositions} onMigrate={onMigrateBorrow} />
          )}
          {noSearchResults && <NoSearchResults searchTerm={searchTerm} />}
        </Box>
      </ContentContainer>
    </>
  );
};
