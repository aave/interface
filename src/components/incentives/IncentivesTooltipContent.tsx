import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';

import { FormattedNumber } from '../primitives/FormattedNumber';
import { Row } from '../primitives/Row';
import { TokenIcon } from '../primitives/TokenIcon';

const IncentivesSymbolMap: {
  [key: string]: {
    tokenIconSymbol: string;
    symbol: string;
    aToken: boolean;
  };
} = {
  aEthLidoWETH: {
    tokenIconSymbol: 'WETH',
    symbol: 'aWETH',
    aToken: true,
  },
  aBasUSDC: {
    tokenIconSymbol: 'usdc',
    symbol: 'aUSDC',
    aToken: true,
  },
  aBasCBBTC: {
    tokenIconSymbol: 'CBBTC',
    symbol: 'aCBBTC',
    aToken: true,
  },
  aEthUSDS: {
    tokenIconSymbol: 'usds',
    symbol: 'aUSDS',
    aToken: true,
  },
  aEthLidowstETH: {
    tokenIconSymbol: 'wstETH',
    symbol: 'awstETH',
    aToken: true,
  },
  aEthUSDC: {
    tokenIconSymbol: 'USDC',
    symbol: 'aUSDC',
    aToken: true,
  },
  aEthUSDT: {
    tokenIconSymbol: 'USDT',
    symbol: 'aUSDT',
    aToken: true,
  },
  aEthPYUSD: {
    tokenIconSymbol: 'PYUSD',
    symbol: 'aPYUSD',
    aToken: true,
  },
  aArbWETH: {
    tokenIconSymbol: 'WETH',
    symbol: 'aWETH',
    aToken: true,
  },
  aArbwstETH: {
    tokenIconSymbol: 'wstETH',
    symbol: 'awstETH',
    aToken: true,
  },
  aBaswstETH: {
    tokenIconSymbol: 'wstETH',
    symbol: 'awstETH',
    aToken: true,
  },
  aBasEURC: {
    tokenIconSymbol: 'EURC',
    symbol: 'aEURC',
    aToken: true,
  },
  aBasGHO: {
    tokenIconSymbol: 'GHO',
    symbol: 'aGHO',
    aToken: true,
  },
  aAvaSAVAX: {
    tokenIconSymbol: 'sAVAX',
    symbol: 'asAVAX',
    aToken: true,
  },
  aEthRLUSD: {
    tokenIconSymbol: 'RLUSD',
    symbol: 'aRLUSD',
    aToken: true,
  },
  aSonwS: {
    tokenIconSymbol: 'wS',
    symbol: 'awS',
    aToken: true,
  },
  aBasweETH: {
    tokenIconSymbol: 'weETH',
    symbol: 'aweETH',
    aToken: true,
  },
  aCelCELO: {
    tokenIconSymbol: 'CELO',
    symbol: 'aCELO',
    aToken: true,
  },
  aGnoEURe: {
    tokenIconSymbol: 'EURe',
    symbol: 'aEURe',
    aToken: true,
  },
  aEthUSDtb: {
    tokenIconSymbol: 'USDtb',
    symbol: 'aUSDtb',
    aToken: true,
  },
  aUSDtb: {
    tokenIconSymbol: 'USDtb',
    symbol: 'aUSDtb',
    aToken: true,
  },
  aSonstS: {
    tokenIconSymbol: 'stS',
    symbol: 'astS',
    aToken: true,
  },
};

interface IncentivesTooltipContentProps {
  incentives: ReserveIncentiveResponse[];
  incentivesNetAPR: 'Infinity' | number;
  symbol: string;
}

export const getSymbolMap = (incentive: ReserveIncentiveResponse) => {
  const rewardTokenSymbol = incentive.rewardTokenSymbol;

  return IncentivesSymbolMap[rewardTokenSymbol]
    ? {
        ...IncentivesSymbolMap[rewardTokenSymbol],
        rewardTokenAddress: incentive.rewardTokenAddress,
        incentiveAPR: incentive.incentiveAPR,
      }
    : {
        ...incentive,
        tokenIconSymbol: rewardTokenSymbol,
        symbol: rewardTokenSymbol,
        aToken: false,
      };
};

export const IncentivesTooltipContent = ({
  incentives,
  incentivesNetAPR,
  symbol,
}: IncentivesTooltipContentProps) => {
  const typographyVariant = 'secondary12';

  const Number = ({ incentiveAPR }: { incentiveAPR: 'Infinity' | number | string }) => {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
        {incentiveAPR !== 'Infinity' ? (
          <>
            <FormattedNumber value={+incentiveAPR} percent variant={typographyVariant} />
            <Typography variant={typographyVariant} sx={{ ml: 1 }}>
              <Trans>APR</Trans>
            </Typography>
          </>
        ) : (
          <>
            <Typography variant={typographyVariant}>∞ %</Typography>
            <Typography variant={typographyVariant} sx={{ ml: 1 }}>
              <Trans>APR</Trans>
            </Typography>
          </>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <Typography variant="caption" color="text.secondary" mb={3}>
        <Trans>Participating in this {symbol} reserve gives annualized rewards.</Trans>
      </Typography>

      <Box sx={{ width: '100%' }}>
        {incentives.map(getSymbolMap).map((incentive) => {
          return (
            <Row
              height={32}
              caption={
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: incentives.length > 1 ? 2 : 0,
                  }}
                >
                  <TokenIcon
                    aToken={incentive.aToken}
                    symbol={incentive.tokenIconSymbol}
                    sx={{ fontSize: '20px', mr: 1 }}
                  />
                  <Typography variant={typographyVariant}>{incentive.symbol}</Typography>
                </Box>
              }
              key={incentive.rewardTokenAddress}
              width="100%"
            >
              <Number incentiveAPR={incentive.incentiveAPR} />
            </Row>
          );
        })}

        {incentives.length > 1 && (
          <Box sx={() => ({ pt: 1, mt: 1 })}>
            <Row caption={<Trans>Net APR</Trans>} height={32}>
              <Number incentiveAPR={incentivesNetAPR} />
            </Row>
          </Box>
        )}
      </Box>
    </Box>
  );
};
