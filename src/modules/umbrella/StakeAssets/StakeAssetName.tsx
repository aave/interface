import { Trans } from '@lingui/macro';
import { Stack, Typography } from '@mui/material';
import { TokenContractTooltip } from 'src/components/infoTooltips/TokenContractTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { TextWithTooltip } from 'src/components/TextWithTooltip';

export const StakeAssetName = ({
  iconSymbol,
  symbol,
  totalAmountStakedUSD,
  targetLiquidityUSD,
  apyAtTargetLiquidity,
  explorerUrl,
}: {
  iconSymbol: string;
  symbol: string;
  totalAmountStakedUSD: string;
  targetLiquidityUSD: string;
  apyAtTargetLiquidity: string;
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
          <TextWithTooltip>
            <Stack direction="column" gap={2} sx={{ width: '100%', minWidth: '160px' }}>
              <Row
                caption={
                  <Typography variant="secondary12" sx={{ ml: 1 }}>
                    <Trans>Target liquidity</Trans>
                  </Typography>
                }
              >
                <FormattedNumber
                  variant="caption"
                  value={targetLiquidityUSD}
                  visibleDecimals={2}
                  symbol="usd"
                />
              </Row>
              <Row
                caption={
                  <Stack direction="column">
                    <Typography variant="secondary12" sx={{ ml: 1 }}>
                      <Trans>Reward APY at target liquidity</Trans>
                    </Typography>
                    <Typography variant="helperText" sx={{ ml: 1, fontStyle: 'italic' }}>
                      (<Trans>Excludes variable supply APY</Trans>)
                    </Typography>
                  </Stack>
                }
              >
                <FormattedNumber
                  sx={{ alignSelf: 'start' }}
                  variant="caption"
                  value={apyAtTargetLiquidity}
                  percent
                />
              </Row>
            </Stack>
          </TextWithTooltip>
        </Stack>
      </Stack>
    </>
  );
};
