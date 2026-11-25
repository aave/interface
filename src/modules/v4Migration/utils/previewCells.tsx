import { Box } from '@mui/material';
import { ReactNode } from 'react';
import { HealthFactorNumber } from 'src/components/HealthFactorNumber';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';

import { NumberChange, ValueChange } from '../V4MigrationPage/components/ValueChange';

/** Cells for the migration preview table, shared by the earn and borrow review steps. */

export const pct = (value: number) => <FormattedNumber value={value} percent variant="inherit" />;

export const usd = (value: number) => (
  <FormattedNumber value={value} symbol="USD" variant="inherit" />
);

/** A before/after cell, or nothing when the API has no figure for the "before" side. */
export const change = (
  variation: { current: string | null; after: string | null } | undefined,
  format: 'percent' | 'usd' | 'number'
): ReactNode => {
  if (!variation || variation.current === null) return undefined;
  const value = {
    current: Number(variation.current),
    after: variation.after === null ? undefined : Number(variation.after),
  };
  if (format === 'number') return <NumberChange value={value} />;
  return format === 'percent' ? (
    <NumberChange value={value} percent />
  ) : (
    <NumberChange value={value} symbol="USD" />
  );
};

const TOKENS_SX = { display: 'inline-flex', alignItems: 'center', gap: '0.5rem' } as const;

/** A token amount, with the token's icon in front when `iconSymbol` is given. */
export const tokens = (symbol: string, amount: string, iconSymbol?: string) => (
  <Box component="span" sx={TOKENS_SX}>
    {iconSymbol ? <TokenIcon symbol={iconSymbol} sx={{ fontSize: '1.25rem' }} /> : null}
    <FormattedNumber value={amount} symbol={symbol} variant="inherit" />
  </Box>
);

export const healthFactor = (value: string) => (
  <HealthFactorNumber
    value={value}
    variant="inherit"
    withHeart
    heartGap="0.375rem"
    sx={{ color: 'inherit' }}
  />
);

/** A health factor before and after, or nothing when there is no "before" to show. */
export const healthFactorChange = (
  variation: { current: string | null; after: string | null } | undefined
): ReactNode => {
  if (!variation || variation.current === null) return undefined;
  return (
    <ValueChange
      current={healthFactor(variation.current)}
      after={variation.after === null ? undefined : healthFactor(variation.after)}
    />
  );
};
