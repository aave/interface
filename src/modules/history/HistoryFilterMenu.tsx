import { XCircleIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Check as CheckIcon, Sort as SortIcon } from '@mui/icons-material';
import { Box, Button, Divider, Menu, MenuItem, SvgIcon, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';

interface HistoryFilterMenuProps {
  onFilterChange: (filter: FilterOptions[]) => void;
  currentFilter: FilterOptions[];
}

export enum FilterOptions {
  SUPPLY,
  BORROW,
  WITHDRAW,
  REPAY,
  RATECHANGE,
  COLLATERALCHANGE,
  LIQUIDATION,
}

interface FilterLabelProps {
  filter: FilterOptions;
}

const FilterLabel: React.FC<FilterLabelProps> = ({ filter }) => {
  switch (filter) {
    case FilterOptions.SUPPLY:
      return <Trans>Supply</Trans>;
    case FilterOptions.BORROW:
      return <Trans>Borrow</Trans>;
    case FilterOptions.WITHDRAW:
      return <Trans>Withdraw</Trans>;
    case FilterOptions.REPAY:
      return <Trans>Repay</Trans>;
    case FilterOptions.RATECHANGE:
      return <Trans>Rate change</Trans>;
    case FilterOptions.COLLATERALCHANGE:
      return <Trans>Collateral change</Trans>;
    case FilterOptions.LIQUIDATION:
      return <Trans>Liqudation</Trans>;
  }
};

export const HistoryFilterMenu: React.FC<HistoryFilterMenuProps> = ({
  onFilterChange,
  currentFilter,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFilterClick = (filter: FilterOptions | undefined) => {
    let newFilter: FilterOptions[] = [];

    if (filter !== undefined) {
      if (currentFilter.includes(filter)) {
        newFilter = currentFilter.filter((item) => item !== filter);
      } else {
        newFilter = [...currentFilter, filter];
      }
    }

    onFilterChange(newFilter);
  };

  const FilterButtonLabel = () => {
    if (currentFilter.length === 0) {
      return <Trans>All transactions</Trans>;
    } else {
      const displayLimit = 2;
      const hiddenCount = currentFilter.length - displayLimit;
      const displayedFilters = currentFilter.slice(0, displayLimit).map((filter) => (
        <React.Fragment key={filter}>
          <FilterLabel filter={filter} />
          {filter !== currentFilter[currentFilter.length - 1] && ','}
          {filter !== currentFilter[displayLimit - 1] && ' '}
        </React.Fragment>
      ));

      return (
        <Box sx={{ display: 'flex' }}>
          <Typography variant="description" color={theme.palette.primary.main} sx={{ mr: 1 }}>
            TXs:
          </Typography>
          {displayedFilters}
          {hiddenCount > 0 && <React.Fragment>...(+{hiddenCount})</React.Fragment>}
        </Box>
      );
    }
  };

  const handleClearFilter = (event: React.MouseEvent) => {
    event.stopPropagation();
    onFilterChange([]);
  };

  return (
    <Box>
      <Button
        sx={{
          minWidth: 148,
          maxWidth: 360,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 36,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '4px',
          mr: 2,
          pl: 2,
          pr: 1,
        }}
        onClick={handleClick}
      >
        <Box display="flex" alignItems="center" overflow="hidden">
          <SvgIcon height={9} width={9} color="primary">
            <SortIcon />
          </SvgIcon>
          <Typography
            variant="subheader1"
            color="text.primary"
            sx={{
              ml: 1,
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              mr: 1,
            }}
          >
            <FilterButtonLabel />
          </Typography>
        </Box>
        {currentFilter.length > 0 && (
          <DarkTooltip
            title={
              <Typography variant="caption" color="common.white">
                <Trans>Reset</Trans>
              </Typography>
            }
          >
            <Box
              sx={{
                cursor: 'pointer',
                color: 'primary',
                height: 'auto',
                width: 'auto',
                display: 'flex',
                alignItems: 'center',
              }}
              onClick={handleClearFilter}
            >
              <XCircleIcon color="#A5A8B6" width={18} height={18} />
            </Box>
          </DarkTooltip>
        )}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 280,
            maxHeight: 300,
            mt: 1,
          },
        }}
      >
        <MenuItem
          onClick={() => handleFilterClick(undefined)}
          sx={{
            background: currentFilter.length === 0 ? theme.palette.background.surface : undefined,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="subheader1" color="text.primary">
            <Trans>All transactions</Trans>
          </Typography>
          {currentFilter.length === 0 && (
            <SvgIcon sx={{ fontSize: '16px' }}>
              <CheckIcon />
            </SvgIcon>
          )}
        </MenuItem>
        <Divider sx={{ mt: 1 }} />
        <Box
          sx={{
            overflowY: 'scroll',
            maxHeight: 200,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '::-webkit-scrollbar': {
              display: 'none',
            },
          }}
        >
          {Object.keys(FilterOptions)
            .filter((key) => isNaN(Number(key)))
            .map((optionKey) => {
              const option = FilterOptions[optionKey as keyof typeof FilterOptions];
              return (
                <MenuItem
                  key={optionKey}
                  onClick={() => handleFilterClick(option)}
                  sx={{
                    background: currentFilter.includes(option)
                      ? theme.palette.background.surface
                      : undefined,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="subheader1" color="text.primary">
                    <FilterLabel filter={option} />
                  </Typography>
                  {currentFilter.includes(option) && (
                    <SvgIcon sx={{ fontSize: '16px' }}>
                      <CheckIcon />
                    </SvgIcon>
                  )}
                </MenuItem>
              );
            })}
        </Box>
      </Menu>
    </Box>
  );
};
