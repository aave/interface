import { Trans } from '@lingui/macro';
import { Box, Typography, useTheme } from '@mui/material';
import { ExtendedReserveIncentiveResponse } from 'src/hooks/useMerklIncentives';

import { PointsBasedCampaignTooltip } from '../infoTooltips/PointsBasedCampaignTooltip';
import { FormattedNumber } from '../primitives/FormattedNumber';
import { Link } from '../primitives/Link';
import { Row } from '../primitives/Row';
import { TokenIcon } from '../primitives/TokenIcon';
import { getSymbolMap } from './IncentivesTooltipContent';

export const MerklIncentivesTooltipContent = ({
  merklIncentives,
}: {
  merklIncentives: ExtendedReserveIncentiveResponse;
}) => {
  const theme = useTheme();

  const typographyVariant = 'secondary12';

  const merklIncentivesFormatted = getSymbolMap(merklIncentives);

  const isPointsBased = Boolean(merklIncentives?.breakdown?.points);
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'start',
        flexDirection: 'column',
      }}
    >
      <img
        src={
          theme.palette.mode === 'dark'
            ? `/icons/other/merkl-white.svg`
            : `/icons/other/merkl-black.svg`
        }
        width="100px"
        height="40px"
        alt=""
      />

      <Typography variant="caption" color="text.primary" mb={3}>
        <Trans>Eligible for incentives through Merkl.</Trans>
      </Typography>

      <Typography variant="caption" color="text.secondary" mb={3}>
        <Trans>
          This is a program initiated by the Aave DAO and implemented by Merkl. Aave Labs does not
          guarantee the program and accepts no liability.
        </Trans>
      </Typography>

      <Typography variant="caption" color="text.strong" mb={3}>
        <Trans>Merkl rewards are claimed through the</Trans>{' '}
        <Link href="https://app.merkl.xyz/" sx={{ textDecoration: 'underline' }} variant="caption">
          official app
        </Link>
        {'.'}
        {merklIncentives.customClaimMessage ? (
          <>
            {' '}
            <Trans> {merklIncentives.customClaimMessage}</Trans>
          </>
        ) : null}
      </Typography>

      {merklIncentives.customMessage ? (
        <Typography variant="caption" color="text.strong" mb={3}>
          <Trans>{merklIncentives.customMessage}</Trans>{' '}
          <Link
            href={
              merklIncentives.customForumLink
                ? merklIncentives.customForumLink
                : 'https://governance.aave.com/t/arfc-set-aci-as-emission-manager-for-liquidity-mining-programs/17898'
            }
            sx={{ textDecoration: 'underline' }}
            variant="caption"
          >
            Learn more
          </Link>
        </Typography>
      ) : (
        <Typography variant="caption" color="text.strong" mb={3}>
          <Trans>{merklIncentives.description}</Trans>{' '}
          <Link
            href={
              merklIncentives.customForumLink
                ? merklIncentives.customForumLink
                : 'https://governance.aave.com/t/arfc-set-aci-as-emission-manager-for-liquidity-mining-programs/17898'
            }
            sx={{ textDecoration: 'underline' }}
            variant="caption"
          >
            Learn more
          </Link>
        </Typography>
      )}

      <Box sx={{ width: '100%' }}>
        {merklIncentives.breakdown ? (
          <>
            {/* Protocol APY */}
            <Row
              height={32}
              caption={
                <Typography variant={typographyVariant}>
                  <Trans>Protocol APY</Trans>
                </Typography>
              }
              width="100%"
            >
              <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <FormattedNumber
                  value={merklIncentives.breakdown.protocolAPY}
                  percent
                  variant={typographyVariant}
                />
                <Typography variant={typographyVariant} sx={{ ml: 1 }}>
                  <Trans>APY</Trans>
                </Typography>
              </Box>
            </Row>

            {/* Protocol APR */}
            {merklIncentives.breakdown.protocolIncentivesAPR > 0 && (
              <Row
                height={32}
                caption={
                  <Typography variant={typographyVariant}>
                    <Trans>Protocol Incentives</Trans>
                  </Typography>
                }
                width="100%"
              >
                <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                  <FormattedNumber
                    value={merklIncentives.breakdown.protocolIncentivesAPR}
                    percent
                    variant={typographyVariant}
                  />
                  <Typography variant={typographyVariant} sx={{ ml: 1 }}>
                    <Trans>APY</Trans>
                  </Typography>
                </Box>
              </Row>
            )}

            {/* Merkl Incentives */}
            {isPointsBased ? (
              <Row
                height={32}
                caption={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 0,
                    }}
                  >
                    <Typography variant={typographyVariant}>Points</Typography>
                    <PointsBasedCampaignTooltip
                      aToken={merklIncentivesFormatted.aToken}
                      tokenIconSymbol={merklIncentivesFormatted.tokenIconSymbol}
                      symbol={merklIncentivesFormatted.symbol}
                      isBorrow={merklIncentives.breakdown.isBorrow}
                      pointsPerThousandUsd={
                        merklIncentives.breakdown.points?.pointsPerThousandUsd || 0
                      }
                      sx={{ marginLeft: 1 }}
                    />
                  </Box>
                }
                width="100%"
              >
                <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                  <FormattedNumber
                    value={merklIncentives.breakdown.points?.pointsPerThousandUsd || 0}
                    visibleDecimals={2}
                    variant={typographyVariant}
                  />
                  <Typography variant={typographyVariant} sx={{ ml: 1 }}>
                    <Trans>Points</Trans>
                  </Typography>
                </Box>
              </Row>
            ) : merklIncentives.rewardsTokensMappedApys &&
              merklIncentives.rewardsTokensMappedApys.length > 1 ? (
              <>
                {merklIncentives.rewardsTokensMappedApys.map((reward, index) => {
                  const { tokenIconSymbol, symbol, aToken } = getSymbolMap({
                    rewardTokenSymbol: reward.token.symbol,
                    rewardTokenAddress: reward.token.address,
                    incentiveAPR: reward.apy.toString(),
                  });
                  return (
                    <Row
                      key={index}
                      height={32}
                      caption={
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 0,
                          }}
                        >
                          <TokenIcon
                            symbol={tokenIconSymbol}
                            aToken={aToken}
                            sx={{ fontSize: '20px', mr: 1 }}
                          />
                          <Typography variant={typographyVariant}>{symbol}</Typography>
                          <Typography variant={typographyVariant} sx={{ ml: 0.5 }}>
                            {merklIncentives.breakdown.isBorrow ? '(-)' : '(+)'}
                          </Typography>
                        </Box>
                      }
                      width="100%"
                    >
                      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                        <FormattedNumber
                          value={merklIncentives.breakdown.isBorrow ? -reward.apy : reward.apy}
                          percent
                          variant={typographyVariant}
                        />
                        <Typography variant={typographyVariant} sx={{ ml: 1 }}>
                          <Trans>APY</Trans>
                        </Typography>
                      </Box>
                    </Row>
                  );
                })}
              </>
            ) : (
              <Row
                height={32}
                caption={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 0,
                    }}
                  >
                    <TokenIcon
                      aToken={merklIncentivesFormatted.aToken}
                      symbol={merklIncentivesFormatted.tokenIconSymbol}
                      sx={{ fontSize: '20px', mr: 1 }}
                    />
                    <Typography variant={typographyVariant}>
                      {merklIncentivesFormatted.symbol}
                    </Typography>
                    <Typography variant={typographyVariant} sx={{ ml: 0.5 }}>
                      {merklIncentives.breakdown.isBorrow ? '(-)' : '(+)'}
                    </Typography>
                  </Box>
                }
                width="100%"
              >
                <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                  <FormattedNumber
                    value={
                      merklIncentives.breakdown.isBorrow
                        ? -merklIncentives.breakdown.merklIncentivesAPR
                        : merklIncentives.breakdown.merklIncentivesAPR
                    }
                    percent
                    variant={typographyVariant}
                  />
                  <Typography variant={typographyVariant} sx={{ ml: 1 }}>
                    <Trans>APY</Trans>
                  </Typography>
                </Box>
              </Row>
            )}

            {/* Total APY */}
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Row
                height={32}
                caption={
                  <Typography variant={typographyVariant} fontWeight={600}>
                    <Trans>Total APY</Trans>
                  </Typography>
                }
                width="100%"
              >
                <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                  <FormattedNumber
                    value={merklIncentives.breakdown.totalAPY}
                    percent
                    variant={typographyVariant}
                    color="text.primary"
                  />
                  <Typography variant={typographyVariant} sx={{ ml: 1 }} color="text.primary">
                    <Trans>APY</Trans>
                  </Typography>
                </Box>
              </Row>
            </Box>
          </>
        ) : (
          <Row
            height={32}
            caption={
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 0,
                }}
              >
                <TokenIcon
                  aToken={merklIncentivesFormatted.aToken}
                  symbol={merklIncentivesFormatted.tokenIconSymbol}
                  sx={{ fontSize: '20px', mr: 1 }}
                />
                <Typography variant={typographyVariant}>
                  {merklIncentivesFormatted.symbol}
                </Typography>
              </Box>
            }
            width="100%"
          >
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <FormattedNumber
                value={+merklIncentivesFormatted.incentiveAPR}
                percent
                variant={typographyVariant}
              />
              <Typography variant={typographyVariant} sx={{ ml: 1 }}>
                <Trans>APY</Trans>
              </Typography>
            </Box>
          </Row>
        )}
      </Box>
    </Box>
  );
};
