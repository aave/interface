import { Stake } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Button, Skeleton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { BigNumber } from 'bignumber.js';
import GhoBorrowApyRange from 'src/components/GhoBorrowApyRange';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { FormattedReservesAndIncentives } from 'src/hooks/pool/usePoolFormattedReserves';
import { useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { useMeritIncentives } from 'src/hooks/useMeritIncentives';
import { useRootStore } from 'src/store/root';
import { GHO_SYMBOL } from 'src/utils/ghoUtilities';

interface GhoBannerProps {
  reserve?: FormattedReservesAndIncentives;
}

export const SavingsGhoBanner = ({ reserve }: GhoBannerProps) => {
  const theme = useTheme();
  const isCustomBreakpoint = useMediaQuery('(min-width:1125px)');
  const isMd = useMediaQuery(theme.breakpoints.up('xs'));
  const isMd2 = useMediaQuery(theme.breakpoints.up('md'));
  const downToMd = useMediaQuery('(min-width:870px)');
  const downToSm = useMediaQuery('(max-width:780px)');

  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const currentMarket = useRootStore((store) => store.currentMarket);
  const { data: meritIncentives, isLoading: meritIncentivesLoading } = useMeritIncentives({
    symbol: GHO_SYMBOL,
    market: currentMarketData.market,
  });
  const { data: stakeGeneralResult, isLoading: stakeDataLoading } = useGeneralStakeUiData(
    currentMarketData,
    Stake.gho
  );

  const totalStakedUsd = stakeGeneralResult?.[0]?.totalSupplyUSDFormatted;

  if (downToSm) {
    return <GhoSavingsBannerMobile reserve={reserve} />;
  }

  return (
    <Stack
      sx={{
        pt: 5,
        mb: 10,
        px: { md: 6 },
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <Stack
        component={Link}
        href={ROUTES.reserveOverview(reserve?.underlyingAsset || '', currentMarket)}
        sx={(theme) => ({
          [theme.breakpoints.up(780)]: {
            height: '116px',
            flexDirection: 'row',
            alignItems: 'center',
          },
          flexDirection: 'column',
          alignItems: 'flex-start',
          height: '188px',
          borderRadius: { md: 4 },
          display: 'flex',
          backgroundColor: theme.palette.mode === 'dark' ? '#39375A80' : '#F7F7F9',
          position: 'relative',
          justifyContent: 'space-between',
          gap: { xs: 6 },
        })}
      >
        <Box
          component="img"
          src="/sgho-banner.svg"
          alt="ghost and coin"
          sx={{
            height: isMd2 ? '130px' : '100px',
            mb: isMd2 ? 2 : 1,
            mr: isMd2 ? -8 : -4,
            display: downToSm ? 'none' : 'block',
          }}
        />
        <Stack direction="column">
          <Typography
            sx={(theme) => ({
              [theme.breakpoints.up(1125)]: { typography: 'h3' },
              typography: {
                xs: 'subheader1',
                md: 'h4',
              },
            })}
          >
            <Trans>Save with sGHO</Trans>
          </Typography>
          <Typography
            sx={(theme) => ({
              [theme.breakpoints.up(1125)]: { typography: 'description' },
              typography: { xs: 'caption' },
            })}
            color="text.secondary"
          >
            GHO yield with instant withdraws.
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" gap={3}>
          <TokenIcon
            symbol="sgho"
            sx={{
              fontSize: '38px',
              display: downToMd ? 'block' : 'none',
            }}
          />
          <Stack direction="column" alignItems="flex-start">
            {stakeDataLoading ? (
              <Skeleton width={70} height={25} />
            ) : (
              <Stack direction="row" gap={1} alignItems="center">
                <FormattedNumber
                  symbol="USD"
                  compact
                  variant={isCustomBreakpoint ? 'h3' : isMd ? 'secondary16' : 'secondary14'}
                  value={totalStakedUsd || 0}
                />
              </Stack>
            )}
            <Typography
              sx={{
                ['@media screen and (min-width: 1125px)']: { typography: 'description' },
                typography: { xs: 'caption' },
              }}
              color="text.secondary"
              noWrap
            >
              <Trans>Total deposited</Trans>
            </Typography>
          </Stack>
        </Stack>
        <Stack>
          {meritIncentivesLoading ? (
            <Skeleton width={70} height={25} />
          ) : (
            <Stack direction="row" gap={1} alignItems="center">
              <FormattedNumber
                percent
                variant={isCustomBreakpoint ? 'h3' : isMd ? 'secondary16' : 'secondary14'}
                value={meritIncentives?.incentiveAPR || 0}
              />
            </Stack>
          )}
          <Typography
            sx={{
              ['@media screen and (min-width: 1125px)']: { typography: 'description' },
              typography: { xs: 'caption' },
            }}
            color="text.secondary"
            noWrap
          >
            <Trans>APY</Trans>
          </Typography>
        </Stack>
        <Box />
        <Button
          variant="contained"
          component={Link}
          size="medium"
          href={ROUTES.reserveOverview(reserve?.underlyingAsset || '', currentMarket)}
          sx={{
            mr: 8,
            ml: isMd2 ? 12 : 0,
          }}
        >
          <Trans>View details</Trans>
        </Button>
      </Stack>
    </Stack>
  );
};

const GhoSavingsBannerMobile = ({ reserve }: GhoBannerProps) => {
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const currentMarket = useRootStore((store) => store.currentMarket);
  const { data: meritIncentives, isLoading: meritIncentivesLoading } = useMeritIncentives({
    symbol: GHO_SYMBOL,
    market: currentMarketData.market,
  });
  const { data: stakeGeneralResult, isLoading: stakeDataLoading } = useGeneralStakeUiData(
    currentMarketData,
    Stake.gho
  );

  const totalStakedUsd = stakeGeneralResult?.[0]?.totalSupplyUSDFormatted;

  return (
    <Stack
      sx={{
        pt: 5,
        mb: 10,
        px: { md: 6 },
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <Stack
        component={Link}
        href={ROUTES.reserveOverview(reserve?.underlyingAsset || '', currentMarket)}
        sx={(theme) => ({
          [theme.breakpoints.up(780)]: {
            height: '116px',
            flexDirection: 'row',
            alignItems: 'center',
          },
          flexDirection: 'column',
          alignItems: 'flex-start',
          height: '188px',
          borderRadius: { md: 4 },
          display: 'flex',
          backgroundColor: theme.palette.mode === 'dark' ? '#39375A80' : '#F7F7F9',
          position: 'relative',
          justifyContent: 'space-between',
          gap: { xs: 6 },
        })}
      >
        <Box
          component="img"
          src="/sgho-banner.svg"
          alt="ghost and coin"
          sx={{ position: 'absolute', height: '100px', top: -8, right: 8 }}
        />
        <Stack
          direction="column"
          sx={{ width: '100%', height: '100%', padding: '16px' }}
          justifyContent="space-between"
        >
          <Stack direction="column">
            <Typography variant="subheader1">
              <Trans>Save with sGHO</Trans>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              GHO yield with instant withdraws.
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" gap={4}>
            <TokenIcon symbol="sgho" sx={{ fontSize: '38px' }} />
            <Stack direction="column" alignItems="flex-start">
              {stakeDataLoading ? (
                <Skeleton width={70} height={25} />
              ) : (
                <Stack direction="row" gap={1} alignItems="center">
                  <FormattedNumber
                    symbol="USD"
                    compact
                    variant="secondary14"
                    value={totalStakedUsd || 0}
                  />
                </Stack>
              )}
              <Typography variant="caption" color="text.secondary" noWrap>
                <Trans>Total deposited</Trans>
              </Typography>
            </Stack>
            <Stack>
              {meritIncentivesLoading ? (
                <Skeleton width={70} height={25} />
              ) : (
                <Stack direction="row" gap={1} alignItems="center">
                  <FormattedNumber
                    percent
                    variant="secondary14"
                    value={meritIncentives?.incentiveAPR || 0}
                  />
                </Stack>
              )}
              <Typography variant="caption" color="text.secondary" noWrap>
                <Trans>APY</Trans>
              </Typography>
            </Stack>
          </Stack>
          <Button
            variant="contained"
            fullWidth
            component={Link}
            size="medium"
            href={ROUTES.reserveOverview(reserve?.underlyingAsset || '', currentMarket)}
          >
            <Trans>View details</Trans>
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export const GhoBanner = ({ reserve }: GhoBannerProps) => {
  const theme = useTheme();
  const isCustomBreakpoint = useMediaQuery('(min-width:1125px)');
  const isMd = useMediaQuery(theme.breakpoints.up('xs'));
  const currentMarket = useRootStore((store) => store.currentMarket);
  const { ghoReserveData, ghoLoadingData } = useAppDataContext();

  const totalBorrowed = BigNumber.min(
    valueToBigNumber(reserve?.totalDebt || 0),
    valueToBigNumber(reserve?.borrowCap || 0)
  ).toNumber();

  return (
    <Box
      sx={{
        pt: 5,
        mb: 10,
        px: {
          md: 6,
        },
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <Box
        component={Link}
        href={ROUTES.reserveOverview(reserve?.underlyingAsset || '', currentMarket)}
        sx={(theme) => ({
          borderRadius: {
            md: 4,
          },
          display: 'flex',
          backgroundColor: theme.palette.mode === 'dark' ? '#39375A80' : '#F7F7F9',

          position: 'relative',
          alignItems: {
            xs: 'none',
            xsm: 'center',
          },
          justifyContent: {
            xs: 'space-around',
            xsm: 'none',
          },
          flexDirection: {
            xs: 'column',
            xsm: 'row',
          },
          [theme.breakpoints.up(1125)]: {
            padding: {
              xs: '24px 24px 24px 230px',
              lg: '24px 32px 24px 240x',
            },
          },
          padding: {
            xs: '16px',
            xsm: '16px 16px 16px 180px',
            sm: '16px 24px 16px 188px',
            md: '22px 20px 22px 200px',
          },
          gap: {
            xs: 6,
          },
        })}
      >
        <Box
          component="img"
          src="/gho-group.svg"
          alt="ghost and coin"
          sx={{
            ['@media screen and (min-width: 1125px)']: {
              width: 214,
            },
            width: {
              xs: 100,
              xsm: 160,
              sm: 165,
              md: 180,
            },
            position: 'absolute',
            top: {
              xs: -15,
              xsm: 36,
              sm: 12,
              md: -13,
              lg: -12,
            },
            right: {
              xs: 0,
              xsm: 'unset',
            },
            left: {
              xsm: 10,
            },
          }}
        />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            mr: {
              lg: '5%',
            },
            alignItems: {
              xs: 'none',
              md: 'middle',
            },
            flexDirection: {
              xs: 'column',
              '@media screen and (min-width: 1025px)': {
                flexDirection: 'row',
              },
            },
            gap: {
              xs: 3,
            },
            height: '100%',
          }}
        >
          <Box
            sx={{
              pr: {
                xs: '140px',
                xsm: 0,
              },
              cursor: 'pointer',
              zIndex: 100,
              minWidth: {
                md: 232,
              },
              ['@media screen and (min-width: 1125px)']: {
                width: {
                  xs: '278px',
                  lg: '320px',
                },
              },
            }}
          >
            <Typography
              sx={(theme) => ({
                [theme.breakpoints.up(1125)]: {
                  typography: 'h3',
                },
                typography: {
                  xs: 'subheader1',
                  md: 'h4',
                },
              })}
            >
              <Trans>Meet GHO</Trans>
            </Typography>
            <Typography
              sx={(theme) => ({
                [theme.breakpoints.up(1125)]: {
                  typography: 'description',
                },
                typography: {
                  xs: 'caption',
                },
              })}
              color="text.secondary"
            >
              A decentralized, multi-collateralized stablecoin created by AaveDAO.
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: {
                xs: 4,
                lg: 15,
              },
              cursor: 'pointer',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                alignItems: 'center',
              }}
            >
              <TokenIcon
                symbol="GHO"
                sx={{
                  fontSize: '38px',
                  display: {
                    xs: 'block',
                    xsm: 'none',
                    sm: 'block',
                  },
                }}
              />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                {ghoLoadingData ? (
                  <Skeleton width={70} height={25} />
                ) : (
                  <Stack direction="row" gap={1} alignItems="center">
                    <FormattedNumber
                      symbol="USD"
                      compact
                      variant={isCustomBreakpoint ? 'h3' : isMd ? 'secondary16' : 'secondary14'}
                      value={totalBorrowed}
                    />
                    <Stack direction="row" gap={1} sx={{ marginTop: 0.5 }}>
                      <Typography variant="caption">
                        <Trans>of</Trans>
                      </Typography>
                      <FormattedNumber
                        symbol="USD"
                        compact
                        variant="caption"
                        value={reserve?.borrowCap || 0}
                      />
                    </Stack>
                  </Stack>
                )}
                <Typography
                  sx={{
                    ['@media screen and (min-width: 1125px)']: {
                      typography: 'description',
                    },
                    typography: {
                      xs: 'caption',
                    },
                  }}
                  color="text.secondary"
                  noWrap
                >
                  <Trans>Total borrowed</Trans>
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <GhoBorrowApyRange
                minVal={ghoReserveData.ghoBorrowAPYWithMaxDiscount}
                maxVal={ghoReserveData.ghoVariableBorrowAPY}
                variant={isCustomBreakpoint ? 'h3' : isMd ? 'secondary16' : 'secondary14'}
                percentVariant={isCustomBreakpoint ? 'h3' : isMd ? 'secondary16' : 'secondary14'}
                hyphenVariant={isCustomBreakpoint ? 'h3' : isMd ? 'secondary16' : 'secondary14'}
              />
              <Typography
                sx={{
                  ['@media screen and (min-width: 1125px)']: {
                    typography: 'description',
                  },
                  typography: {
                    xs: 'caption',
                  },
                }}
                color="text.secondary"
                noWrap
              >
                <TextWithTooltip
                  sx={{
                    ['@media screen and (min-width: 1125px)']: {
                      typography: 'description',
                    },
                    typography: {
                      xs: 'caption',
                    },
                  }}
                  text={<Trans>Borrow rate</Trans>}
                >
                  <>
                    <Trans>
                      Users who stake AAVE in Safety Module (i.e. stkAAVE holders) receive a
                      discount on GHO borrow interest rate.
                    </Trans>
                  </>
                </TextWithTooltip>
              </Typography>
            </Box>
            <Button
              variant="contained"
              component={Link}
              size={'medium'}
              href={ROUTES.reserveOverview(reserve?.underlyingAsset || '', currentMarket)}
              sx={{
                display: {
                  xs: 'none',
                  sm: 'flex',
                },
                marginLeft: {
                  xs: 'none',
                  xsm: 'auto',
                },
                whiteSpace: 'no-wrap',
                minWidth: 'max-content',
                alignSelf: 'center',
              }}
            >
              <Trans>View details</Trans>
            </Button>
          </Box>
        </Box>
        <Button
          variant="contained"
          component={Link}
          size={'large'}
          href={ROUTES.reserveOverview(reserve?.underlyingAsset || '', currentMarket)}
          sx={{
            display: {
              xs: 'flex',
              sm: 'none',
            },
            marginLeft: {
              xs: 'none',
              xsm: 'auto',
            },
            whiteSpace: 'no-wrap',
            minWidth: 'max-content',
          }}
        >
          <Trans>View details</Trans>
        </Button>
      </Box>
    </Box>
  );
};
