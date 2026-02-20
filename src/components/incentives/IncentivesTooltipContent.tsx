import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { useMeritIncentives } from 'src/hooks/useMeritIncentives';
import { useMerklIncentives } from 'src/hooks/useMerklIncentives';
import { convertAprToApy } from 'src/utils/utils';

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
  aBasWETH: {
    tokenIconSymbol: 'WETH',
    symbol: 'aWETH',
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
  aArbARB: {
    tokenIconSymbol: 'ARB',
    symbol: 'aARB',
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
  aHorRwaRLUSD: {
    tokenIconSymbol: 'RLUSD',
    symbol: 'aRLUSD',
    aToken: true,
  },
  aHorRwaUSDC: {
    tokenIconSymbol: 'USDC',
    symbol: 'aUSDC',
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
  aCelUSDm: {
    tokenIconSymbol: 'USDm',
    symbol: 'aUSDm',
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
  aLinweETH: {
    tokenIconSymbol: 'weETH',
    symbol: 'aweETH',
    aToken: true,
  },
  aSonstS: {
    tokenIconSymbol: 'stS',
    symbol: 'astS',
    aToken: true,
  },
  aEthEURC: {
    tokenIconSymbol: 'EURC',
    symbol: 'aEURC',
    aToken: true,
  },
  aEthUSDe: {
    tokenIconSymbol: 'USDe',
    symbol: 'aUSDe',
    aToken: true,
  },
  aZksZK: {
    tokenIconSymbol: 'ZK',
    symbol: 'aZK',
    aToken: true,
  },
  aScrSCR: {
    tokenIconSymbol: 'SCR',
    symbol: 'aSCR',
    aToken: true,
  },
  aPlaUSDe: {
    tokenIconSymbol: 'USDe',
    symbol: 'aUSDe',
    aToken: true,
  },
  tydroInkPoints: {
    tokenIconSymbol: 'TydroInkPoints',
    symbol: 'TydroInkPoints',
    aToken: false,
  },
  aEthUSDG: {
    tokenIconSymbol: 'USDG',
    symbol: 'aUSDG',
    aToken: true,
  },
  aOP: {
    tokenIconSymbol: 'OP',
    symbol: 'aOP',
    aToken: true,
  },
  'aUSD₮': {
    tokenIconSymbol: 'usdt',
    symbol: 'aUSDT',
    aToken: true,
  },
  aManUSDe: {
    tokenIconSymbol: 'USDe',
    symbol: 'aUSDe',
    aToken: true,
  },
  aManWMNT: {
    tokenIconSymbol: 'WMNT',
    symbol: 'aWMNT',
    aToken: true,
  },
  aManwrsETH: {
    tokenIconSymbol: 'wrsETH',
    symbol: 'awrsETH',
    aToken: true,
  },
};

interface IncentivesTooltipContentProps {
  incentives: ReserveIncentiveResponse[];
  incentivesNetAPR: 'Infinity' | number;
  symbol: string;
  market?: string;
  protocolAction?: ProtocolAction;
  protocolAPY?: number;
  address?: string;
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
  market,
  protocolAction,
  protocolAPY = 0,
  address,
}: IncentivesTooltipContentProps) => {
  const typographyVariant = 'secondary12';

  const { data: meritIncentives } = useMeritIncentives({
    symbol,
    market: market || '',
    protocolAction,
    protocolAPY,
    protocolIncentives: incentives,
  });

  const { data: merklIncentives } = useMerklIncentives({
    market: market || '',
    rewardedAsset: address,
    protocolAction,
    protocolAPY,
    protocolIncentives: incentives,
  });

  const Number = ({ incentiveAPR }: { incentiveAPR: 'Infinity' | number | string }) => {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
        {incentiveAPR !== 'Infinity' ? (
          <>
            <FormattedNumber value={+incentiveAPR} percent variant={typographyVariant} />
            <Typography variant={typographyVariant} sx={{ ml: 1 }}>
              <Trans>APY</Trans>
            </Typography>
          </>
        ) : (
          <>
            <Typography variant={typographyVariant}>∞ %</Typography>
            <Typography variant={typographyVariant} sx={{ ml: 1 }}>
              <Trans>APY</Trans>
            </Typography>
          </>
        )}
      </Box>
    );
  };

  const meritIncentivesAPR = meritIncentives?.breakdown?.meritIncentivesAPR || 0;
  const merklIncentivesAPR = merklIncentives?.breakdown?.merklIncentivesAPR || 0;

  // For borrow, incentives are subtracted; for supply, they're added
  const isBorrow = protocolAction === ProtocolAction.borrow;
  const totalAPY = isBorrow
    ? protocolAPY -
      (incentivesNetAPR === 'Infinity' ? 0 : incentivesNetAPR) -
      meritIncentivesAPR -
      merklIncentivesAPR
    : protocolAPY +
      (incentivesNetAPR === 'Infinity' ? 0 : incentivesNetAPR) +
      meritIncentivesAPR +
      merklIncentivesAPR;

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
        {protocolAPY > 0 && (
          <Row
            height={32}
            caption={
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant={typographyVariant}>Protocol APY</Typography>
              </Box>
            }
            width="100%"
          >
            <FormattedNumber value={protocolAPY} percent variant={typographyVariant} />
          </Row>
        )}

        {/* Show Protocol Incentives */}
        {incentives.map(getSymbolMap).map((incentive) => {
          const displayAPR =
            isBorrow && incentive.incentiveAPR !== 'Infinity'
              ? -+incentivesNetAPR
              : incentive.incentiveAPR;
          const displayAPY = convertAprToApy(displayAPR as number);

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
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant={typographyVariant}>{incentive.symbol}</Typography>
                    <Typography variant={typographyVariant} sx={{ ml: 0.5 }}>
                      {isBorrow ? '(-)' : '(+)'}
                    </Typography>
                  </Box>
                </Box>
              }
              key={incentive.rewardTokenAddress}
              width="100%"
            >
              <Number incentiveAPR={displayAPY} />
            </Row>
          );
        })}

        {/* Show Merit Incentives if available */}
        {meritIncentives && meritIncentives.breakdown && (
          <Row
            height={32}
            caption={
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <img
                  src={'/icons/other/aci-black.svg'}
                  width="20px"
                  height="20px"
                  alt="Merit"
                  style={{ marginRight: '8px' }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant={typographyVariant}>Merit Incentives</Typography>
                  <Typography variant={typographyVariant} sx={{ ml: 0.5 }}>
                    {isBorrow ? '(-)' : '(+)'}
                  </Typography>
                </Box>
              </Box>
            }
            width="100%"
          >
            <FormattedNumber
              value={
                isBorrow
                  ? -meritIncentives.breakdown.meritIncentivesAPR
                  : meritIncentives.breakdown.meritIncentivesAPR
              }
              percent
              variant={typographyVariant}
            />
          </Row>
        )}

        {/* Show Merkl Incentives if available */}
        {merklIncentives && merklIncentives.breakdown && (
          <Row
            height={32}
            caption={
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant={typographyVariant}>Merkl Incentives</Typography>
                  <Typography variant={typographyVariant} sx={{ ml: 0.5 }}>
                    {isBorrow ? '(-)' : '(+)'}
                  </Typography>
                </Box>
              </Box>
            }
            width="100%"
          >
            <FormattedNumber
              value={
                isBorrow
                  ? -merklIncentives.breakdown.merklIncentivesAPR
                  : merklIncentives.breakdown.merklIncentivesAPR
              }
              percent
              variant={typographyVariant}
            />
          </Row>
        )}

        {/* Show Net APR (protocol incentives only) if multiple incentives */}
        {incentives.length > 1 && (
          <Box sx={() => ({ pt: 1, mt: 1 })}>
            <Row
              caption={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant={typographyVariant}>
                    <Trans>Net Protocol Incentives</Trans>
                  </Typography>
                  <Typography variant={typographyVariant} sx={{ ml: 0.5 }}>
                    {isBorrow ? '(-)' : '(+)'}
                  </Typography>
                </Box>
              }
              height={32}
            >
              <Number
                incentiveAPR={
                  isBorrow && incentivesNetAPR !== 'Infinity' ? -incentivesNetAPR : incentivesNetAPR
                }
              />
            </Row>
          </Box>
        )}

        {/* Show Total APY if we have Merit incentives or protocol APY */}
        {(meritIncentives?.breakdown || protocolAPY > 0) && (
          <Box sx={() => ({ pt: 1, mt: 1, borderTop: '1px solid rgba(255, 255, 255, 0.1)' })}>
            <Row
              caption={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant={typographyVariant} fontWeight="600">
                    <Trans>Total APY</Trans>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    ({isBorrow ? 'Borrow Rate' : 'Supply Rate'})
                  </Typography>
                </Box>
              }
              height={32}
            >
              <FormattedNumber
                value={totalAPY}
                percent
                variant={typographyVariant}
                fontWeight="600"
              />
            </Row>
          </Box>
        )}
      </Box>
    </Box>
  );
};
