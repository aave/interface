import { Stack, Typography } from '@mui/material';
import { TokenContractTooltip } from 'src/components/infoTooltips/TokenContractTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';

export const StakeAssetName = ({
  stakeAsset,
  explorerUrl,
}: {
  stakeAsset: MergedStakeData;
  explorerUrl: string;
}) => {
  return (
    <>
      <TokenIcon symbol={stakeAsset.iconSymbol} fontSize="large" />
      <Stack ml={2}>
        <Stack direction="row" alignItems="center">
          <Typography variant="h4" noWrap>
            Stake {stakeAsset.symbol}
          </Typography>
          <TokenContractTooltip explorerUrl={explorerUrl} />
        </Stack>

        <Stack direction="row">
          <Typography variant="caption" color="text.secondary">
            Total staked:{' '}
            <FormattedNumber
              variant="caption"
              value={stakeAsset.formattedStakeTokenData.totalAmountStaked}
              visibleDecimals={2}
            />
            {' ('}
            <FormattedNumber
              variant="caption"
              value={stakeAsset.formattedStakeTokenData.totalAmountStakedUSD}
              visibleDecimals={2}
              symbol="usd"
            />
            {')'}
          </Typography>
        </Stack>
      </Stack>
    </>
  );
};
