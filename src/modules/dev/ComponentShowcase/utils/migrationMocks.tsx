import { Box, Switch } from '@mui/material';
import { Curator } from 'src/components/CuratorBy';
import { DescriptionItem } from 'src/components/DynamicCard/DescriptionItem';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { MIGRATE_AMOUNT } from 'src/modules/v4Migration/utils/copy';

export const SIDES = [
  { value: 'earn', label: 'Earn' },
  { value: 'borrow', label: 'Borrow' },
] as const;

export type Side = (typeof SIDES)[number]['value'];

export const SENTORA: Curator = {
  name: 'Sentora',
  icon: '/icons/curators/sentora.webp',
  tooltip: 'Curator details (placeholder until the copy is designed)',
};

export const usd = (value: number, compact?: boolean) => (
  <FormattedNumber value={value} symbol="USD" compact={compact} variant="inherit" />
);

export const pct = (value: number) => <FormattedNumber value={value} percent variant="inherit" />;

const TOKENS_SX = { display: 'inline-flex', alignItems: 'center', gap: '0.5rem' } as const;
const TOKEN_ICON_SX = { fontSize: '1.25rem' } as const;

export const tokens = (symbol: string, amount: number, decimals: number, icon?: boolean) => (
  <Box component="span" sx={TOKENS_SX}>
    {icon ? <TokenIcon symbol={symbol} sx={TOKEN_ICON_SX} /> : null}
    <FormattedNumber value={amount} visibleDecimals={decimals} symbol={symbol} variant="inherit" />
  </Box>
);

export const collateralRow = (checked: boolean, onChange: (checked: boolean) => void) => (
  <DescriptionItem
    label={MIGRATE_AMOUNT.useAsCollateral.label}
    labelTooltip={MIGRATE_AMOUNT.useAsCollateral.tooltip}
    value={
      <Switch
        checked={checked}
        onChange={(_, next) => onChange(next)}
        inputProps={{ 'aria-label': MIGRATE_AMOUNT.useAsCollateral.ariaLabel() }}
      />
    }
  />
);
