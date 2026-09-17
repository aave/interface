import { XCircleIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import CheckIcon from '@mui/icons-material/Check';
import SortIcon from '@mui/icons-material/Sort';
import {
  Box,
  Button,
  Divider,
  Menu,
  MenuItem,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { useRootStore } from 'src/store/root';
import { TRANSACTION_HISTORY } from 'src/utils/events';
import { figVars } from 'src/utils/figmaColors';

import { FilterOptions } from './types';

interface HistoryFilterMenuProps {
  onFilterChange: (filter: FilterOptions[]) => void;
  currentFilter: FilterOptions[];
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
      return <Trans>Liquidation</Trans>;
    case FilterOptions.SWAP:
      return <Trans>Swap</Trans>;
    case FilterOptions.COLLATERAL_SWAP:
      return <Trans>Collateral Swap</Trans>;
    case FilterOptions.DEBT_SWAP:
      return <Trans>Debt Swap</Trans>;
    case FilterOptions.REPAY_WITH_COLLATERAL:
      return <Trans>Repay with Collateral</Trans>;
    case FilterOptions.WITHDRAW_AND_SWAP:
      return <Trans>Withdraw and Swap</Trans>;
  }
};

export const HistoryFilterMenu: React.FC<HistoryFilterMenuProps> = ({
  onFilterChange,
  currentFilter,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [localFilter, setLocalFilter] = useState<FilterOptions[]>(currentFilter);
  const trackEvent = useRootStore((store) => store.trackEvent);

  useEffect(() => {
    onFilterChange(localFilter);
  }, [localFilter, onFilterChange]);

  const theme = useTheme();
  const downToMD = useMediaQuery(theme.breakpoints.down('md'));

  const allSelected = currentFilter.length === 0;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    onFilterChange(currentFilter);
  };

  const handleFilterClick = (filter: FilterOptions | undefined) => {
    let newFilter: FilterOptions[] = [];
    if (filter !== undefined) {
      if (currentFilter.includes(filter)) {
        newFilter = currentFilter.filter((item) => item !== filter);
      } else {
        trackEvent(TRANSACTION_HISTORY.FILTER, { value: filter });
        newFilter = [...currentFilter, filter];
        // Checks if all filter options are selected,  enum length is divided by 2 based on how Typescript creates object from enum
        if (newFilter.length === Object.keys(FilterOptions).length / 2) {
          newFilter = [];
        }
      }
    }

    setLocalFilter(newFilter);
  };

  const FilterButtonLabel = () => {
    if (allSelected) {
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
          <Typography variant="description" color="primary.main" sx={{ mr: 1 }}>
            TXs:
          </Typography>
          {displayedFilters}
          {hiddenCount > 0 && <React.Fragment>...(+{hiddenCount})</React.Fragment>}
        </Box>
      );
    }
  };

  const handleClearFilter = (event: React.MouseEvent) => {
    trackEvent(TRANSACTION_HISTORY.FILTER, { value: 'cleared' });
    event.stopPropagation();
    setLocalFilter([]);
  };

  return (
    <Box>
      <Button
        sx={{
          minWidth: 148,
          maxWidth: downToMD ? '100%' : 360,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 36,
          border: '1px solid',
          borderColor: 'border-2',
          borderRadius: '4px',
          mr: downToMD ? 0 : 2,
          ml: downToMD ? 4 : 0,
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
            color="fg-1"
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
        {!allSelected && (
          <DarkTooltip
            title={
              <Typography variant="caption">
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
              <SvgIcon sx={{ color: 'fg-3', fontSize: 18 }}>
                <XCircleIcon />
              </SvgIcon>
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
            boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.2), 0px 2px 10px rgba(0, 0, 0, 0.1)',
            borderRadius: '4px',
          },
        }}
      >
        <MenuItem
          onClick={() => handleFilterClick(undefined)}
          sx={{
            background: allSelected ? figVars['bg-2'] : undefined,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="subheader1" color="fg-1">
            <Trans>All transactions</Trans>
          </Typography>
          {allSelected && (
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
                    background: currentFilter.includes(option) ? figVars['bg-2'] : undefined,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="subheader1" color="fg-1">
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
