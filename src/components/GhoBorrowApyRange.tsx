import { Box, Skeleton, Typography, TypographyPropsVariantOverrides } from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';
import { OverridableStringUnion } from '@mui/types';
import React from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';

import { FormattedNumber } from './primitives/FormattedNumber';

type GhoBorrowApyRangeProps = {
  minVal?: number;
  maxVal?: number;
  percentVariant?: OverridableStringUnion<Variant | 'inherit', TypographyPropsVariantOverrides>;
  hyphenVariant?: OverridableStringUnion<Variant | 'inherit', TypographyPropsVariantOverrides>;
};

/**
 * This component displays two borrow APY values as percentages with two decimal places and a hyphen in between.
 * This component can take in optional range values and display variants for typography of the percentage values and the hyphen.
 * If no range values are provided, which would usually be APY values related to different user balances, then the default values are variable borrow APY with no discount as maximum range value and with the max discount as the minimum range value.
 */
const GhoBorrowApyRange: React.FC<GhoBorrowApyRangeProps> = ({
  minVal,
  maxVal,
  percentVariant,
  hyphenVariant,
}) => {
  const { ghoLoadingData, ghoReserveData } = useAppDataContext();

  if (ghoLoadingData) return <Skeleton width={70} height={24} />;

  // Check precision, could be different by small amount but show same
  const lowRangeValue = minVal ?? ghoReserveData.ghoBorrowAPYWithMaxDiscount;
  const highRangeValue = maxVal ?? ghoReserveData.ghoVariableBorrowAPY;

  // Normalize and compare, round to two decimal places as if they'd be formatted
  const normalizedLowValue = Number((lowRangeValue * 100).toFixed(2));
  const normalizedHighValue = Number((highRangeValue * 100).toFixed(2));
  const isSameDisplayValue = normalizedLowValue === normalizedHighValue;

  // Just show one value if they are the same display value after being formatted, otherwise, hyphenate and show both values
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {isSameDisplayValue ? (
        <FormattedNumber
          compact
          percent
          value={lowRangeValue} // 50/50 choice
          visibleDecimals={2}
          variant={percentVariant ?? 'h3'}
        />
      ) : (
        <>
          <FormattedNumber
            compact
            value={lowRangeValue * 100}
            visibleDecimals={2}
            variant={percentVariant ?? 'h3'}
          />
          <Typography
            variant={hyphenVariant ?? 'secondary16'}
            color="text.secondary"
            sx={{ mx: 0.5 }}
          >
            -
          </Typography>
          <FormattedNumber
            compact
            percent
            value={highRangeValue}
            visibleDecimals={2}
            variant={percentVariant ?? 'h3'}
          />
        </>
      )}
    </Box>
  );
};

export default GhoBorrowApyRange;
