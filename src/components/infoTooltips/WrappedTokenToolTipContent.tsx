import { ArrowNarrowRightIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Skeleton, Stack, SvgIcon, Typography } from '@mui/material';
import { useTokenOutForTokenIn } from 'src/hooks/token-wrapper/useTokenWrapper';

import { FormattedNumber } from '../primitives/FormattedNumber';

export const WrappedTokenTooltipContent = ({
  decimals,
  tokenWrapperAddress,
  tokenInSymbol,
  tokenOutSymbol,
}: {
  decimals: number;
  tokenWrapperAddress: string;
  tokenInSymbol: string;
  tokenOutSymbol: string;
}) => {
  const { isLoading: loadingExchangeRate, data: exchangeRate } = useTokenOutForTokenIn(
    '1',
    decimals,
    tokenWrapperAddress
  );

  return (
    <Stack direction="column" gap={3}>
      <Typography variant="tooltip">
        <Trans>
          DAI balance will be converted via DSR contracts and then supplied as sDAI. Switching
          incurs no additional costs and no slippage.
        </Trans>
      </Typography>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="secondary12">
            <Trans>Exchange rate</Trans>
          </Typography>
        </Box>
        {loadingExchangeRate ? (
          <Skeleton variant="rectangular" width={120} height={14} />
        ) : (
          <Stack direction="row" alignItems="center" gap={1}>
            <FormattedNumber
              value="1"
              visibleDecimals={0}
              variant="secondary12"
              color="text.primary"
            />
            <Typography variant="tooltip">{tokenInSymbol}</Typography>
            <SvgIcon color="primary" sx={{ fontSize: '12px' }}>
              <ArrowNarrowRightIcon />
            </SvgIcon>
            <FormattedNumber
              value={exchangeRate || '0'}
              visibleDecimals={4}
              variant="secondary12"
              color="text.primary"
            />
            <Typography variant="tooltip">{tokenOutSymbol}</Typography>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};
