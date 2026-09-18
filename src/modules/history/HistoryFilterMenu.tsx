import { Trans } from '@lingui/macro';
import { Button, Checkbox, Divider, ListItemText, Menu, MenuItem } from '@mui/material';
import React, { useState } from 'react';
import { ChevronUpDownIcon } from 'src/components/icons/ChevronUpDownIcon';
import { useRootStore } from 'src/store/root';
import { TRANSACTION_HISTORY } from 'src/utils/events';

import { FilterOptions } from './types';

interface HistoryFilterMenuProps {
  onFilterChange: (filter: FilterOptions[]) => void;
  currentFilter: FilterOptions[];
}

const filterLabels: Record<FilterOptions, React.ReactNode> = {
  [FilterOptions.SUPPLY]: <Trans>Supply</Trans>,
  [FilterOptions.BORROW]: <Trans>Borrow</Trans>,
  [FilterOptions.WITHDRAW]: <Trans>Withdraw</Trans>,
  [FilterOptions.REPAY]: <Trans>Repay</Trans>,
  [FilterOptions.RATECHANGE]: <Trans>Rate change</Trans>,
  [FilterOptions.COLLATERALCHANGE]: <Trans>Collateral change</Trans>,
  [FilterOptions.LIQUIDATION]: <Trans>Liquidation</Trans>,
  [FilterOptions.SWAP]: <Trans>Swap</Trans>,
  [FilterOptions.COLLATERAL_SWAP]: <Trans>Collateral Swap</Trans>,
  [FilterOptions.DEBT_SWAP]: <Trans>Debt Swap</Trans>,
  [FilterOptions.REPAY_WITH_COLLATERAL]: <Trans>Repay with Collateral</Trans>,
  [FilterOptions.WITHDRAW_AND_SWAP]: <Trans>Withdraw and Swap</Trans>,
};

const filterOptions = Object.keys(FilterOptions)
  .filter((key) => isNaN(Number(key)))
  .map((key) => FilterOptions[key as keyof typeof FilterOptions]);

// The menu's option row. `role` differs between the reset row (radio: picks one state) and the
// type rows (checkbox: each toggles independently); everything else is shared.
const OptionRow = ({
  role,
  checked,
  onClick,
  children,
}: {
  role: 'menuitemradio' | 'menuitemcheckbox';
  checked: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <MenuItem onClick={onClick} role={role} aria-checked={checked} sx={{ gap: '0.5rem' }}>
    <Checkbox
      checked={checked}
      inputProps={{ readOnly: true, tabIndex: -1, 'aria-hidden': true }}
      sx={{ p: 0, pointerEvents: 'none' }}
    />
    <ListItemText>{children}</ListItemText>
  </MenuItem>
);

export const HistoryFilterMenu: React.FC<HistoryFilterMenuProps> = ({
  onFilterChange,
  currentFilter,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const trackEvent = useRootStore((store) => store.trackEvent);

  const open = Boolean(anchorEl);
  const selectedCount = currentFilter.length;
  // No type selected is the same result as every type selected, and reads better on the trigger.
  const allSelected = selectedCount === 0;

  const handleFilterToggle = (filter: FilterOptions) => {
    if (currentFilter.includes(filter)) {
      onFilterChange(currentFilter.filter((item) => item !== filter));
      return;
    }

    trackEvent(TRANSACTION_HISTORY.FILTER, { value: filter });
    const newFilter = [...currentFilter, filter];
    onFilterChange(newFilter.length === filterOptions.length ? [] : newFilter);
  };

  const handleSelectAll = () => {
    trackEvent(TRANSACTION_HISTORY.FILTER, { value: 'cleared' });
    onFilterChange([]);
  };

  return (
    <>
      <Button
        onClick={(event) => setAnchorEl(event.currentTarget)}
        variant="outlined"
        aria-haspopup="true"
        aria-expanded={open}
        endIcon={<ChevronUpDownIcon sx={{ fontSize: 18, color: 'fg-3' }} />}
        sx={{ textTransform: 'none' }}
      >
        {allSelected ? (
          <Trans>All transactions</Trans>
        ) : selectedCount === 1 ? (
          filterLabels[currentFilter[0]]
        ) : (
          <Trans>{selectedCount} transaction types</Trans>
        )}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <OptionRow role="menuitemradio" checked={allSelected} onClick={handleSelectAll}>
          <Trans>All transactions</Trans>
        </OptionRow>

        <Divider />

        {filterOptions.map((option) => (
          <OptionRow
            key={option}
            role="menuitemcheckbox"
            checked={currentFilter.includes(option)}
            onClick={() => handleFilterToggle(option)}
          >
            {filterLabels[option]}
          </OptionRow>
        ))}
      </Menu>
    </>
  );
};
