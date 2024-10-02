import { XCircleIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Check as CheckIcon, Sort as SortIcon } from '@mui/icons-material';
import {
  Box,
  Button,
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
import { TRANSACTION_HISTORY } from 'src/utils/mixPanelEvents';

import { FilterOptions } from './types';

interface HistoryFilterMenuProps {
  onFilterChange: (filter: FilterOptions[]) => void;
  currentFilter: FilterOptions[];
  checkTonNetwork?: boolean;
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
    default:
      return null;
  }
};

export const HistoryFilterMenu: React.FC<HistoryFilterMenuProps> = ({
  onFilterChange,
  currentFilter,
  checkTonNetwork = false, // Giá trị mặc định là false nếu không truyền
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [localFilter, setLocalFilter] = useState<FilterOptions[]>(currentFilter);
  const trackEvent = useRootStore((store) => store.trackEvent);

  useEffect(() => {
    onFilterChange(localFilter);
  }, [localFilter, onFilterChange]);

  const theme = useTheme();
  const downToMD = useMediaQuery(theme.breakpoints.down('md'));

  const hiddenFilterOptions = checkTonNetwork ? [FilterOptions.RATECHANGE] : [];

  const visibleFilterOptions = Object.keys(FilterOptions)
    .filter(
      (key) =>
        isNaN(Number(key)) &&
        !hiddenFilterOptions.includes(FilterOptions[key as keyof typeof FilterOptions])
    )
    .map((key) => FilterOptions[key as keyof typeof FilterOptions]) as FilterOptions[];

  const allSelected = currentFilter.length === 0;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    onFilterChange(localFilter);
  };

  const handleFilterClick = (filter: FilterOptions | undefined) => {
    let newFilter: FilterOptions[] = [];
    if (filter !== undefined) {
      if (currentFilter.includes(filter)) {
        newFilter = currentFilter.filter((item) => item !== filter);
      } else {
        trackEvent(TRANSACTION_HISTORY.FILTER, { value: filter });
        newFilter = [...currentFilter, filter];
        if (newFilter.length === visibleFilterOptions.length) {
          newFilter = []; // Set "All transactions"
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
          <Typography variant="description" color={theme.palette.primary.main} sx={{ mr: 1 }}>
            TXs:&nbsp;
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
        variant="text"
        size="medium"
        sx={(theme) => ({
          maxWidth: downToMD ? '100%' : 360,
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          color: theme.palette.text.secondary,
          px: 5,
          height: 42,
          width: 'auto',
          minWidth: 205,
        })}
        onClick={handleClick}
        startIcon={
          <SvgIcon height={9} width={9}>
            <SortIcon />
          </SvgIcon>
        }
      >
        <Typography
          variant="body4"
          sx={{
            ml: 1,
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            mr: 1,
            textTransform: 'none',
          }}
        >
          <FilterButtonLabel />
        </Typography>
        {!allSelected && (
          <DarkTooltip title={<Trans>Reset</Trans>}>
            <Box
              sx={() => ({
                cursor: 'pointer',
                height: 'auto',
                width: 'auto',
                display: 'flex',
                alignItems: 'center',
                ml: 'auto',
              })}
              onClick={handleClearFilter}
            >
              <XCircleIcon width={16} height={16} />
            </Box>
          </DarkTooltip>
        )}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: (theme) => ({
            backgroundColor: theme.palette.background.secondary,
            border: `1px solid ${theme.palette.border.contents}`,
            width: 205,
            maxHeight: 300,
            mt: 1,
            boxShadow: '0px 8px 16px -2px rgba(27, 33, 44, 0.12)',
            borderRadius: 2,
          }),
        }}
        MenuListProps={{
          sx: {
            py: 0,
          },
        }}
      >
        <MenuItem
          onClick={() => handleFilterClick(undefined)}
          sx={{
            background: allSelected ? theme.palette.background.contents : undefined,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Trans>All transactions</Trans>
          {allSelected && (
            <SvgIcon sx={{ fontSize: '16px' }}>
              <CheckIcon />
            </SvgIcon>
          )}
        </MenuItem>
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
          {visibleFilterOptions.map((option) => (
            <MenuItem
              key={option}
              onClick={() => handleFilterClick(option)}
              sx={{
                background: currentFilter.includes(option)
                  ? theme.palette.background.contents
                  : undefined,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <FilterLabel filter={option} />
              {currentFilter.includes(option) && (
                <SvgIcon sx={{ fontSize: '16px' }}>
                  <CheckIcon />
                </SvgIcon>
              )}
            </MenuItem>
          ))}
        </Box>
      </Menu>
    </Box>
  );
};
