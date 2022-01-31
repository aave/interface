import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';

import { FormattedNumber } from '../primitives/FormattedNumber';
import { CapsTooltip } from './CapsTooltip';
import { CapType } from './helper';

interface CapsHintProps {
  capType: CapType;
  capAmount: string;
  totalAmount: string | number;
  isUSD?: boolean;
  withoutText?: boolean;
}

export const CapsHint = ({
  capType,
  capAmount,
  totalAmount,
  isUSD,
  withoutText,
}: CapsHintProps) => {
  const cap = Number(capAmount);
  if (cap <= 0) return null;

  const percentageOfCap = valueToBigNumber(totalAmount).dividedBy(cap).toNumber();
  const value = valueToBigNumber(cap).minus(totalAmount).multipliedBy('0.995').toNumber();

  const title =
    capType === CapType.supplyCap ? (
      <Trans>Available to supply</Trans>
    ) : (
      <Trans>Available to borrow</Trans>
    );

  if (percentageOfCap < 0.99) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ml: withoutText ? 1 : 0 }}>
      <CapsTooltip availableValue={value} isUSD={isUSD} capType={capType} />

      {!withoutText && (
        <>
          <Typography variant="tooltip" color="text.secondary">
            {title}
          </Typography>
          <FormattedNumber
            value={value >= 0 ? value : 0}
            compact
            symbol={isUSD ? 'USD' : undefined}
            variant="tooltip"
          />
        </>
      )}
    </Box>
  );
};
