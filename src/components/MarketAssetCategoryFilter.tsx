import { Trans } from '@lingui/macro';
import { Box, Button, ButtonGroup } from '@mui/material';
import { AssetCategory } from 'src/modules/markets/utils/assetCategories';

interface MarketAssetCategoryFiltersProps {
  selectedCategory: AssetCategory;
  onCategoryChange: (category: AssetCategory) => void;
}

export const MarketAssetCategoryFilter = ({
  selectedCategory,
  onCategoryChange,
}: MarketAssetCategoryFiltersProps) => {
  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <ButtonGroup
        sx={{
          '& .MuiButton-root': {
            textTransform: 'none',
            whiteSpace: 'nowrap',
            minWidth: 'auto',
            p: 2,
            fontSize: '0.875rem',
            '&:hover': {
              borderColor: 'primary.main', // Color del borde en hover
              borderWidth: '1px',
              borderStyle: 'solid',
              zIndex: 1, // Asegura que el borde se vea por encima
            },
            // Si quieres que el outlined button mantenga bordes en hover
          },
        }}
        variant="outlined"
        size="small"
      >
        <Button
          variant={selectedCategory === AssetCategory.ALL ? 'contained' : 'outlined'}
          onClick={() => onCategoryChange(AssetCategory.ALL)}
        >
          <Trans>All</Trans>
        </Button>
        <Button
          variant={selectedCategory === AssetCategory.STABLECOINS ? 'contained' : 'outlined'}
          onClick={() => onCategoryChange(AssetCategory.STABLECOINS)}
        >
          <Trans>Stablecoins</Trans>
        </Button>
        <Button
          variant={selectedCategory === AssetCategory.ETH_CORRELATED ? 'contained' : 'outlined'}
          onClick={() => onCategoryChange(AssetCategory.ETH_CORRELATED)}
        >
          <Trans>ETH Correlated</Trans>
        </Button>
      </ButtonGroup>
    </Box>
  );
};
