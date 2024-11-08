import { Trans } from '@lingui/macro';
import { Typography, useTheme } from '@mui/material';
import { formatEther } from 'ethers/lib/utils';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { GHO_SYMBOL } from 'src/utils/ghoUtilities';

import { DetailsNumberLine } from '../FlowCommons/TxModalDetails';

export const BridgeAmount = ({
  amount,
  maxAmountToBridgeFormatted,
  maxAmountReducedDueToBridgeLimit,
  maxAmountReducedDueToRateLimit,
  refillRate,
  maxRateLimitCapacity,
}: {
  amount: string;
  maxAmountToBridgeFormatted: string;
  maxAmountReducedDueToBridgeLimit: boolean;
  maxAmountReducedDueToRateLimit: boolean;
  refillRate: string;
  maxRateLimitCapacity: string;
}) => {
  const { palette } = useTheme();

  const bridgeLimitTooltip = (
    <Typography variant="caption">
      Due to bridging limits, the maximum amount currently available to bridge is{' '}
      <FormattedNumber variant="caption" value={maxAmountToBridgeFormatted} visibleDecimals={2} />
    </Typography>
  );

  const rateLimitTooltip = (
    <Typography variant="caption">
      The amount you can bridge is currently reduced because of the rate limit. The limit is raised
      at a rate of{' '}
      <FormattedNumber variant="caption" value={formatEther(refillRate)} visibleDecimals={2} /> GHO
      per second, until the maximum amount of{' '}
      <FormattedNumber
        variant="caption"
        value={formatEther(maxRateLimitCapacity)}
        visibleDecimals={2}
      />{' '}
      is reached.
    </Typography>
  );

  return (
    <DetailsNumberLine
      description={
        amount !== '' && (maxAmountReducedDueToBridgeLimit || maxAmountReducedDueToRateLimit) ? (
          <TextWithTooltip
            text={
              <Typography color={palette.warning.main}>
                <Trans>Amount</Trans>
              </Typography>
            }
            iconColor="warning.main"
          >
            <>
              {maxAmountReducedDueToBridgeLimit && bridgeLimitTooltip}
              {maxAmountReducedDueToRateLimit && rateLimitTooltip}
            </>
          </TextWithTooltip>
        ) : (
          <Trans>Amount</Trans>
        )
      }
      iconSymbol={GHO_SYMBOL}
      symbol={GHO_SYMBOL}
      value={amount}
    />
  );
};
