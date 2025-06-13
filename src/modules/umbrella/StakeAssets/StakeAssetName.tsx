import { Stack, Typography } from '@mui/material';
import { TokenContractTooltip } from 'src/components/infoTooltips/TokenContractTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';

export const StakeAssetName = ({
  iconSymbol,
  symbol,
  totalAmountStakedUSD,
  explorerUrl,
}: {
  iconSymbol: string;
  symbol: string;
  totalAmountStakedUSD: string;
  explorerUrl: string;
}) => {
  return (
    <>
      <TokenIcon symbol={iconSymbol} fontSize="large" />
      <Stack ml={2}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="h4" noWrap>
            Stake {symbol}
          </Typography>
          <TokenContractTooltip explorerUrl={explorerUrl} />
        </Stack>

        <Stack direction="row">
          <Typography variant="caption" color="text.secondary">
            Total staked:{' '}
            <FormattedNumber
              variant="caption"
              value={totalAmountStakedUSD}
              visibleDecimals={2}
              symbol="usd"
            />
          </Typography>
        </Stack>
      </Stack>
    </>
  );
};
