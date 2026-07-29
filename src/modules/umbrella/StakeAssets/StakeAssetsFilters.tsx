import { Trans } from '@lingui/macro';
import { Box, Button, Switch, Typography } from '@mui/material';
import { AssetCategoryMultiSelect } from 'src/components/AssetCategoryMultiselect';
import { SearchInput } from 'src/components/SearchInput';
import { AssetCategory } from 'src/modules/markets/utils/assetCategories';

interface StakeAssetsFiltersProps {
  searchPlaceholder: string;
  onSearchTermChange: (value: string) => void;
  selectedCategories: AssetCategory[];
  onCategoriesChange: (categories: AssetCategory[]) => void;
  categoriesDisabled?: boolean;
  /** Optional "In Wallet" toggle — omit on the disconnected preview (no wallet to filter by). */
  inWallet?: { value: boolean; onChange: (value: boolean) => void };
}

export const StakeAssetsFilters = ({
  searchPlaceholder,
  onSearchTermChange,
  selectedCategories,
  onCategoriesChange,
  categoriesDisabled = false,
  inWallet,
}: StakeAssetsFiltersProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
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
          gap: 2,
          width: { xs: '100%', sm: 'auto' },
        }}
      >
        {inWallet && (
          // Outlined toggle: the whole pill flips the filter; the Switch just mirrors its state.
          <Button
            variant="outlined"
            onClick={() => inWallet.onChange(!inWallet.value)}
            aria-pressed={inWallet.value}
            sx={{
              gap: 2,
              textTransform: 'none',
              justifyContent: 'space-between',
              flex: { xs: 1, sm: 'none' },
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

        <AssetCategoryMultiSelect
          selectedCategories={selectedCategories}
          onCategoriesChange={onCategoriesChange}
          disabled={categoriesDisabled}
          sx={{ flex: { xs: 1, sm: 'none' }, width: { xs: 'auto', sm: 'unset' } }}
        />
      </Box>
    </Box>
  );
};
