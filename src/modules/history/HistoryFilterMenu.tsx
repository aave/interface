import { XCircleIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Check as CheckIcon, Sort as SortIcon } from '@mui/icons-material';
import { Box, Button, Divider, Menu, MenuItem, SvgIcon, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';

interface HistoryFilterMenuProps {
  onFilterChange: (filter: FilterOptions[]) => void;
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

export const HistoryFilterMenu: React.FC<HistoryFilterMenuProps> = ({ onFilterChange }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilters] = useState<FilterOptions[]>([]);
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
      if (selectedFilter.includes(filter)) {
        newFilter = selectedFilter.filter((item) => item !== filter);
      } else {
        newFilter = [...selectedFilter, filter];
      }
    }

    setSelectedFilters(newFilter);
    onFilterChange(newFilter);
  };

  const FilterButtonLabel = () => {
    if (selectedFilter.length === 0) {
      return <Trans>All transactions</Trans>;
    } else {
      const displayLimit = 3;
      const hiddenCount = selectedFilter.length - displayLimit;
      const displayedFilters = selectedFilter.slice(0, displayLimit).map((filter) => (
        <React.Fragment key={filter}>
          <FilterLabel filter={filter} />
          {filter !== selectedFilter[displayLimit - 1] && ', '}
        </React.Fragment>
      ));

      return (
        <React.Fragment>
          {displayedFilters}
          {hiddenCount > 0 && <React.Fragment>... (+{hiddenCount})</React.Fragment>}
        </React.Fragment>
      );
    }
  };

  const handleClearFilter = () => {
    setSelectedFilters([]);
    onFilterChange([]);
  };

  return (
    <Box>
      <Button
        sx={{
          width: 148,
          maxWidth: 320,
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
          <SvgIcon height={10} width={10} color="primary">
            <SortIcon />
          </SvgIcon>
          <Typography
            variant="subheader1"
            color="text.primary"
            sx={{ ml: 1, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}
          >
            <FilterButtonLabel />
          </Typography>
        </Box>
        {selectedFilter.length > 0 && (
          <SvgIcon
            height={10}
            width={10}
            sx={{ cursor: 'pointer' }}
            color="primary"
            onClick={handleClearFilter}
          >
            <XCircleIcon />
          </SvgIcon>
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
            background: selectedFilter.length === 0 ? theme.palette.background.surface : undefined,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="subheader1" color="text.primary">
            <Trans>All transactions</Trans>
          </Typography>
          {selectedFilter.length === 0 && (
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
                    background: selectedFilter.includes(option)
                      ? theme.palette.background.surface
                      : undefined,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="subheader1" color="text.primary">
                    <FilterLabel filter={option} />
                  </Typography>
                  {selectedFilter.includes(option) && (
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
