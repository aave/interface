import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';

import { PercentSelector } from '../PercentSelector';

interface AmountBalanceRowProps {
  usdValue: string;
  loading?: boolean;
  balance?: string;
  balanceLabel: ReactNode;
  showControls: boolean;
  disabled?: boolean;
  maxDisabled?: boolean;
  onPercent: (fraction: number) => void;
  onMax: () => void;
}

export const AmountBalanceRow = ({
  usdValue,
  loading,
  balance,
  balanceLabel,
  showControls,
  disabled,
  maxDisabled,
  onPercent,
  onMax,
}: AmountBalanceRowProps) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem', mt: '0.625rem' }}>
    {loading ? (
      <Box sx={{ flex: 1 }} />
    ) : (
      <FormattedNumber
        value={isNaN(Number(usdValue)) ? 0 : Number(usdValue)}
        compact
        symbol="USD"
        variant="description"
        color="fg-3"
        symbolsColor="fg-3"
        flexGrow={1}
      />
    )}

    {balance && (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 0 }}>
        <Typography
          component="div"
          color="fg-3"
          sx={{ display: 'flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap' }}
        >
          {balanceLabel}:
          <FormattedNumber
            value={balance}
            compact
            variant="description"
            color="fg-3"
            symbolsColor="fg-3"
            sx={{ fontWeight: 500 }}
          />
        </Typography>
        {showControls && (
          <>
            <Box sx={{ width: '1px', height: '0.5rem', bgcolor: 'border-0', flexShrink: 0 }} />
            <PercentSelector
              disabled={disabled || Number(balance) === 0}
              onSelectPercent={onPercent}
            />
            <Button
              size="small"
              sx={{
                minWidth: 0,
                height: 'auto',
                p: 0,
                color: 'fg-1',
                '&:hover': { backgroundColor: 'transparent', color: 'fg-2' },
                '&.Mui-disabled': { color: 'fg-4' },
              }}
              onClick={onMax}
              disabled={disabled || maxDisabled}
            >
              <Trans>Max</Trans>
            </Button>
          </>
        )}
      </Box>
    )}
  </Box>
);
