import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Button, Skeleton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { BigNumber } from 'bignumber.js';
import GhoBorrowApyRange from 'src/components/GhoBorrowApyRange';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';

interface GhoBannerProps {
  reserve?: ComputedReserveData;
}

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
