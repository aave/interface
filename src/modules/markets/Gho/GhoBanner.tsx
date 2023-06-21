import { Trans } from '@lingui/macro';
import { Box, Button, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useRouter } from 'next/router';
import GhoBorrowApyRange from 'src/components/GhoBorrowApyRange';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
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
  const router = useRouter();
  const isCustomBreakpoint = useMediaQuery('(min-width:1125px)');
  const isMd = useMediaQuery(theme.breakpoints.up('md'));
  const currentMarket = useRootStore((store) => store.currentMarket);
  const { ghoReserveData, ghoLoadingData } = useAppDataContext();

  const onClick = () => {
    if (reserve) {
      router.push(ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket));
    }
  };

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
        sx={(theme) => ({
          borderRadius: {
            md: 4,
          },
          display: 'flex',
          backgroundColor: theme.palette.mode === 'dark' ? '#39375A80' : '#C9B3F94D',
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
          src="/illustration_desktop.png"
          alt="ghost and coin"
          sx={{
            ['@media screen and (min-width: 1125px)']: {
              width: 290,
            },
            width: {
              xs: 198,
              xsm: 229,
              md: 266,
            },
            position: 'absolute',
            top: {
              xs: -40,
              xsm: -35,
              md: -63,
            },
            right: {
              xs: -50,
              xsm: 'unset',
            },
            left: {
              xsm: -10,
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
              md: 'row',
            },
            gap: {
              xs: 3,
            },
            height: '100%',
          }}
        >
          <Box
            onClick={onClick}
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
            onClick={onClick}
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
                  <FormattedNumber
                    symbol="USD"
                    compact
                    variant={isCustomBreakpoint ? 'h3' : isMd ? 'secondary16' : 'secondary14'}
                    value={ghoReserveData.aaveFacilitatorBucketLevel}
                  />
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
                <Trans>Borrow APY, fixed rate</Trans>
              </Typography>
            </Box>
          </Box>
        </Box>
        <Button
          variant="contained"
          component={Link}
          size={isCustomBreakpoint ? 'medium' : 'large'}
          href={ROUTES.reserveOverview(reserve?.underlyingAsset || '', currentMarket)}
          sx={{
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
