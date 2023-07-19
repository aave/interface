import { Trans } from '@lingui/macro';
import { Box, Skeleton } from '@mui/material';
import BigNumber from 'bignumber.js';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { FormattedNumber } from '../primitives/FormattedNumber';
import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

interface PriceImpactTooltipProps extends TextWithTooltipProps {
  loading: boolean;
  outputAmountUSD: string;
  inputAmountUSD: string;
}

export const PriceImpactTooltip = ({
  loading,
  outputAmountUSD,
  inputAmountUSD,
  ...rest
}: PriceImpactTooltipProps) => {
  const priceDifference: BigNumber = new BigNumber(outputAmountUSD).minus(inputAmountUSD);
  let priceImpact =
    inputAmountUSD && inputAmountUSD !== '0'
      ? priceDifference.dividedBy(inputAmountUSD).times(100).toFixed(2)
      : '0';
  if (priceImpact === '-0.00') {
    priceImpact = '0.00';
  }

  return (
    <TextWithTooltip
      variant="secondary12"
      color="text.secondary"
      event={{
        eventName: GENERAL.TOOL_TIP,
        eventParams: { tooltip: 'Price Impact' },
      }}
      text={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Trans>
            Price impact{' '}
            {loading ? (
              <Skeleton
                variant="rectangular"
                height={12}
                width={25}
                sx={{ borderRadius: '4px', display: 'flex', marginLeft: '4px' }}
              />
            ) : (
              <FormattedNumber
                value={priceImpact}
                visibleDecimals={2}
                variant="secondary12"
                color="text.secondary"
                sx={{ marginLeft: '4px' }}
              />
            )}
            %
          </Trans>
        </Box>
      }
      {...rest}
    >
      <Trans>
        Price impact is the spread between the total value of the entry tokens switched and the
        destination tokens obtained (in USD), which results from the limited liquidity of the
        trading pair.
      </Trans>
    </TextWithTooltip>
  );
};
