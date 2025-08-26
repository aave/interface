import { Trans } from '@lingui/macro';
import { SxProps, Theme, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { AssetCategory } from 'src/modules/markets/utils/assetCategories';

interface MarketAssetCategoryFiltersProps {
  selectedCategory: AssetCategory;
  onCategoryChange: (category: AssetCategory) => void;
  sx?: {
    buttonGroup?: SxProps<Theme>;
    button?: SxProps<Theme>;
  };
}
const categoryLabels = {
  [AssetCategory.ALL]: <Trans>All</Trans>,
  [AssetCategory.STABLECOINS]: <Trans>Stablecoins</Trans>,
  [AssetCategory.ETH_CORRELATED]: <Trans>ETH Correlated</Trans>,
} as const;
const categories = [
  AssetCategory.ALL,
  AssetCategory.STABLECOINS,
  AssetCategory.ETH_CORRELATED,
] as const;

export const MarketAssetCategoryFilter = ({
  selectedCategory,
  onCategoryChange,
  ...props
}: MarketAssetCategoryFiltersProps) => {
  const handleChange = (_event: React.MouseEvent<HTMLElement>, newCategory: AssetCategory) => {
    if (newCategory !== null) {
      onCategoryChange(newCategory);
    }
  };

  return (
    <ToggleButtonGroup
      value={selectedCategory}
      exclusive
      onChange={handleChange}
      aria-label="Asset category"
      sx={{
        width: '100%',
        height: '36px',
        '&.MuiToggleButtonGroup-grouped': {
          borderRadius: 'unset',
        },
        ...props.sx?.buttonGroup,
      }}
    >
      {categories.map((category) => (
        <ToggleButton
          key={category}
          value={category}
          disableRipple
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          sx={(theme): SxProps<Theme> | undefined => ({
            flex: { xs: 1, xsm: 1, sm: 'auto' },
            '&.MuiToggleButtonGroup-grouped:not(.Mui-selected), &.MuiToggleButtonGroup-grouped&.Mui-disabled':
              {
                border: '1px solid transparent',
                backgroundColor: 'background.surface',
                color: 'action.disabled',
              },
            '&.MuiToggleButtonGroup-grouped&.Mui-selected': {
              borderRadius: '4px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: '0px 2px 1px rgba(0, 0, 0, 0.05), 0px 0px 1px rgba(0, 0, 0, 0.25)',
              backgroundColor: 'background.paper',
            },
            ...props.sx?.button,
          })}
        >
          <Typography
            variant="buttonM"
            sx={{
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
            }}
          >
            {categoryLabels[category]}
          </Typography>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};
