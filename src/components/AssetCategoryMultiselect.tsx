import { Trans } from '@lingui/macro';
import {
  Button,
  Checkbox,
  ListItemText,
  Menu,
  MenuItem,
  SxProps,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { ChevronUpDownIcon } from 'src/components/icons/ChevronUpDownIcon';
import { AssetCategory } from 'src/modules/markets/utils/assetCategories';
import { useRootStore } from 'src/store/root';

interface AssetCategoryMultiSelectProps {
  selectedCategories: AssetCategory[];
  onCategoriesChange: (categories: AssetCategory[]) => void;
  disabled?: boolean;
  sx?: SxProps<Theme>;
}

const categoryLabels = {
  [AssetCategory.ALL]: <Trans>All</Trans>,
  [AssetCategory.STABLECOINS]: <Trans>Stablecoins</Trans>,
  [AssetCategory.ETH_CORRELATED]: <Trans>ETH Correlated</Trans>,
  [AssetCategory.PTS]: <Trans>Principal Tokens</Trans>,
} as const;

const categories = [
  AssetCategory.STABLECOINS,
  AssetCategory.ETH_CORRELATED,
  AssetCategory.PTS,
] as const;

export const AssetCategoryMultiSelect = ({
  selectedCategories,
  onCategoriesChange,
  disabled = false,
  sx,
}: AssetCategoryMultiSelectProps) => {
  const { breakpoints } = useTheme();
  const sm = useMediaQuery(breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const currentMarket = useRootStore((store) => store.currentMarket);

  useEffect(() => {
    onCategoriesChange([]);
  }, [currentMarket, onCategoriesChange]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCategoryToggle = (category: AssetCategory) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((cat) => cat !== category)
      : [...selectedCategories, category];

    onCategoriesChange(newCategories);
  };

  const open = Boolean(anchorEl);
  const selectedCount = selectedCategories.length;

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={disabled}
        variant="outlined"
        aria-haspopup="true"
        aria-expanded={open}
        endIcon={<ChevronUpDownIcon sx={{ fontSize: 18, color: 'fg-3' }} />}
        sx={{
          width: sm ? '100%' : 'unset',
          justifyContent: sm ? 'space-between' : 'center',
          textTransform: 'none',
          ...sx,
        }}
      >
        <Typography variant="buttonM" sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
          {selectedCount === 0 ? (
            <Trans>All Categories</Trans>
          ) : selectedCount === 1 ? (
            categoryLabels[selectedCategories[0]]
          ) : (
            <Trans>{selectedCount} Categories</Trans>
          )}
        </Typography>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {categories.map((category) => {
          const checked = selectedCategories.includes(category);
          return (
            <MenuItem
              key={category}
              onClick={() => handleCategoryToggle(category)}
              role="menuitemcheckbox"
              aria-checked={checked}
              sx={{ gap: '0.5rem' }}
            >
              <Checkbox
                checked={checked}
                inputProps={{ readOnly: true, tabIndex: -1, 'aria-hidden': true }}
                sx={{ p: 0, pointerEvents: 'none' }}
              />
              <ListItemText>{categoryLabels[category]}</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};
