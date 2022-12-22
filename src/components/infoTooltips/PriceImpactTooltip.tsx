import { Trans } from '@lingui/macro';
import { Box, Skeleton } from '@mui/material';

import { FormattedNumber } from '../primitives/FormattedNumber';
import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

interface PriceImpactTooltipProps extends TextWithTooltipProps {
  loading: boolean;
  priceImpact: string;
}

export const PriceImpactTooltip = ({ loading, priceImpact, ...rest }: PriceImpactTooltipProps) => {
  return (
    <TextWithTooltip
      variant="secondary12"
      color="text.secondary"
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
        Price impact is the spread between the total value of the entry tokens swapped and the
        destination tokens obtained (in USD), which results from the limited liquidity of the
        trading pair.
      </Trans>
    </TextWithTooltip>
  );
};
