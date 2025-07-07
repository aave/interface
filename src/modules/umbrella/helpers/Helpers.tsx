import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
// import { useState } from 'react';
// import { ContentWithTooltip } from 'src/components/ContentWithTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';

import { TokenIcon } from '../../../components/primitives/TokenIcon';
import { MultiIconWithTooltip } from './MultiIcon';

export const UmbrellaAssetBreakdown = ({
  // market,
  // rewardedAsset,
  symbol,
  underlyingTokenBalance,
  underlyingWaTokenATokenBalance,
  underlyingWaTokenBalance,
  underlyingTokenDecimals,
}: {
  market: string;
  rewardedAsset?: string;
  symbol: string;
  underlyingTokenBalance: string;
  underlyingWaTokenATokenBalance: string;
  underlyingWaTokenBalance: string;
  underlyingTokenDecimals: number;
  // protocolAction?: ProtocolAction;
}) => {
  // const { data: zkSyncIgniteIncentives } = useZkSyncIgniteIncentives(params);

  return (
    <MultiIconWithTooltip
      icons={[
        { src: symbol, aToken: false },
        { src: symbol, aToken: true },
      ]}
      tooltipContent={
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <Typography variant="caption" color="text.secondary" mb={3}>
            <Trans>
              Participating in staking {symbol} gives annualized rewards. Your wallet balance is the
              sum of your aTokens and underlying assets. The breakdown to stake is below
            </Trans>
          </Typography>

          <Box sx={{ width: '100%' }}>
            <Row
              height={32}
              caption={
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    // mb: incentives.length > 1 ? 2 : 0,
                  }}
                >
                  <TokenIcon aToken={false} symbol={symbol} sx={{ fontSize: '20px', mr: 1 }} />
                </Box>
              }
              width="100%"
            >
              <FormattedNumber
                value={normalize(Number(underlyingTokenBalance), underlyingTokenDecimals)}
                compact
                variant="main16"
                values={underlyingTokenBalance}
              />
            </Row>
            <Row
              height={32}
              caption={
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    // mb: incentives.length > 1 ? 2 : 0,
                  }}
                >
                  <TokenIcon aToken={true} symbol={symbol} sx={{ fontSize: '20px', mr: 1 }} />
                </Box>
              }
              width="100%"
            >
              <FormattedNumber
                value={normalize(Number(underlyingWaTokenBalance), underlyingTokenDecimals)}
                compact
                variant="main16"
                values={underlyingWaTokenBalance}
              />
            </Row>

            <Row
              height={32}
              caption={
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    // mb: incentives.length > 1 ? 2 : 0,
                  }}
                >
                  <TokenIcon aToken={true} symbol={symbol} sx={{ fontSize: '20px', mr: 1 }} />
                </Box>
              }
              width="100%"
            >
              <FormattedNumber
                value={normalize(Number(underlyingWaTokenATokenBalance), underlyingTokenDecimals)}
                compact
                variant="main16"
                values={underlyingWaTokenATokenBalance}
              />
            </Row>

            <Box sx={() => ({ pt: 1, mt: 1 })}>
              <Row caption={<Trans>Total</Trans>} height={32}>
                <FormattedNumber
                  value={normalize(
                    Number(underlyingTokenBalance) +
                      Number(underlyingWaTokenBalance) +
                      Number(underlyingWaTokenATokenBalance),
                    underlyingTokenDecimals
                  )}
                  compact
                  variant="main16"
                />
              </Row>
            </Box>
          </Box>
        </Box>
      }
    />
  );
};
