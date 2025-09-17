import { ChevronDownIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  Checkbox,
  Popover,
  SvgIcon,
  SxProps,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import { AssetCategory } from 'src/modules/markets/utils/assetCategories';

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
  [AssetCategory.PTS]: <Trans>Principle Tokens</Trans>,
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

  const handleReset = () => {
    onCategoriesChange([]);
  };

  const open = Boolean(anchorEl);
  const selectedCount = selectedCategories.length;

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={disabled}
        variant="outlined"
        disableRipple
        sx={{
          height: '38px',
          minWidth: 'auto',
          width: sm ? '100%' : 'unset',
          display: 'flex',
          justifyContent: sm ? 'space-between' : 'center',
          alignItems: 'center',
          gap: 3,
          p: '6px 12px',
          textTransform: 'none',
          ...sx,
        }}
      >
        <Typography
          variant="buttonM"
          sx={{ fontSize: '0.875rem', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          {selectedCount === 0 ? (
            <Trans>All Categories</Trans>
          ) : selectedCount === 1 ? (
            categoryLabels[selectedCategories[0]]
          ) : (
            <Trans>{selectedCount} Categories</Trans>
          )}
        </Typography>

        <SvgIcon
          sx={{
            width: '14px',
            height: '14px',
            color: 'text.primary',
            flexShrink: 0,
          }}
        >
          <ChevronDownIcon />
        </SvgIcon>
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            width: '240px',
            backgroundColor: 'background.paper',
            boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.2), 0px 2px 10px rgba(0, 0, 0, 0.1)',
            borderRadius: '4px',
            mt: 2,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            padding: '4px 0px',
            gap: '4px',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '8px 16px',
              gap: '20px',
              height: '32px',
            }}
          >
            <Typography
              variant="subheader2"
              sx={{
                flexGrow: 1,
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '12px',
                lineHeight: '16px',
                letterSpacing: '0.1px',
              }}
            >
              <Trans>Select Categories</Trans>
            </Typography>
            <Button
              onClick={handleReset}
              disableRipple
              sx={{
                minWidth: 'auto',
                padding: 0,
                color: selectedCount > 0 ? 'text.primary' : 'text.disabled',
                textDecoration: selectedCount > 0 ? 'underline' : 'none',
                textUnderlineOffset: '3px',
                textTransform: 'none',

                '&:hover': {
                  backgroundColor: 'transparent',
                  color: selectedCount > 0 ? 'text.primary' : 'text.disabled',
                  textDecoration: selectedCount > 0 ? 'underline' : 'none',
                },
              }}
              disabled={selectedCount === 0}
            >
              <Typography
                variant="subheader2"
                sx={{
                  fontWeight: 500,
                  fontSize: '12px',
                  lineHeight: '16px',
                  letterSpacing: '0.1px',
                }}
              >
                <Trans>Reset</Trans>
              </Typography>
            </Button>
          </Box>

          {/* Category Options */}
          {categories.map((category) => (
            <Box
              key={category}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '10px 16px',
                gap: '12px',
                height: '40px',
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="subheader1"
                  sx={{
                    color: 'text.primary',
                    fontWeight: 600,
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: '0.15px',
                  }}
                >
                  {categoryLabels[category]}
                </Typography>
              </Box>
              <Checkbox
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                sx={{
                  width: '20px',
                  height: '20px',
                  padding: 0,
                  color: 'text.muted',
                  cursor: 'pointer',
                  '&.Mui-checked': {
                    color: 'primary.main',
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
};
