import { Trans } from '@lingui/macro';
import { Box, Button, Switch, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { AssetCategoryMultiSelect } from 'src/components/AssetCategoryMultiselect';
import { SearchInput } from 'src/components/SearchInput';
import { AssetCategory } from 'src/modules/markets/utils/assetCategories';

interface AssetsFilterBarProps {
  searchPlaceholder: string;
  onSearchTermChange: (value: string) => void;
  selectedCategories: AssetCategory[];
  onCategoriesChange: (categories: AssetCategory[]) => void;
  categoriesDisabled?: boolean;
  /** Optional "In Wallet" toggle — omit when there is no connected wallet to filter by. */
  inWallet?: { value: boolean; onChange: (value: boolean) => void };
  /** Optional trailing control, e.g. a `DisplaySettingsMenu`. */
  displaySettings?: ReactNode;
}

export const AssetsFilterBar = ({
  searchPlaceholder,
  onSearchTermChange,
  selectedCategories,
  onCategoriesChange,
  categoriesDisabled = false,
  inWallet,
  displaySettings,
}: AssetsFilterBarProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        gap: { xs: '0.75rem', sm: '0.5rem' },
      }}
    >
      <SearchInput
        wrapperSx={{ width: { xs: '100%', sm: '340px' } }}
        placeholder={searchPlaceholder}
        onSearchTermChange={onSearchTermChange}
      />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'space-between' },
          gap: 2,
          width: { xs: '100%', sm: 'auto' },
        }}
      >
        {inWallet && (
          // The whole pill flips the filter; the Switch just mirrors its state.
          <Button
            variant="outlined"
            onClick={() => inWallet.onChange(!inWallet.value)}
            aria-pressed={inWallet.value}
            sx={{
              gap: 2,
              textTransform: 'none',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="buttonM" sx={{ whiteSpace: 'nowrap' }}>
              <Trans>In Wallet</Trans>
            </Typography>
            <Switch
              checked={inWallet.value}
              inputProps={{ readOnly: true, tabIndex: -1, 'aria-hidden': true }}
              sx={{ pointerEvents: 'none' }}
            />
          </Button>
        )}

        {/* Grouped so the space-between on phones keeps the settings button beside categories. */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AssetCategoryMultiSelect
            variant="outlined"
            selectedCategories={selectedCategories}
            onCategoriesChange={onCategoriesChange}
            disabled={categoriesDisabled}
          />
          {displaySettings}
        </Box>
      </Box>
    </Box>
  );
};
