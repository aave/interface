import { Trans } from '@lingui/macro';
import { Box, Button, Skeleton, styled, Typography, useMediaQuery } from '@mui/material';
import GhoBorrowApyRange from 'src/components/GhoBorrowApyRange';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListItem } from 'src/components/lists/ListItem';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

const FieldSet = styled('fieldset')(({ theme }) => ({
  height: '103px',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '10px',
  margin: 0,
}));

const Legend = styled('legend')(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  marginLeft: `${theme.spacing(5)}`,
  color: theme.palette.text.secondary,
  borderRadius: '4px',
  cursor: 'default',
  ...theme.typography.subheader2,
}));

interface GhoMarketAssetsListItemProps {
  reserve?: ComputedReserveData;
}

export const GhoMarketAssetsListItem = ({ reserve }: GhoMarketAssetsListItemProps) => {
  const isTableChangedToCards = useMediaQuery('(max-width:1125px)');
  const { ghoLoadingData, ghoReserveData } = useAppDataContext();
  return (
    <Box
      sx={{
        pt: 5,
        mb: 10,
        px: {
          md: 6,
        },
        overflowY: 'hidden',
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
          backgroundColor: '#C9B3F94D',
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
          src="/illustration_desktop.svg"
          sx={{
            ['@media screen and (min-width: 1125px)']: {
              width: 'auto',
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
              md: -60,
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
            sx={{
              pr: {
                xs: '140px',
                xsm: 0,
              },
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
                <FormattedNumber
                  symbol="USD"
                  compact
                  sx={{
                    ['@media screen and (min-width: 1125px)']: {
                      typography: 'h3',
                    },
                    typography: {
                      xs: 'secondary14',
                      md: 'secondary16',
                    },
                  }}
                  value={ghoReserveData.aaveFacilitatorRemainingCapacity}
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
                percentVariant="secondary14"
                hyphenVariant="secondary14"
                sx={{
                  ['@media screen and (min-width: 1125px)']: {
                    typography: 'h3',
                  },
                  typography: {
                    xs: 'secondary14',
                    md: 'secondary16',
                  },
                }}
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
          size={isTableChangedToCards ? 'medium' : 'large'}
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

export const GhoMarketAssetsListItem1 = ({ reserve }: GhoMarketAssetsListItemProps) => {
  console.log(reserve?.availableLiquidity);
  const { currentMarket } = useProtocolDataContext();
  const { ghoLoadingData, ghoReserveData } = useAppDataContext();

  return (
    <Box sx={{ px: 3, mt: 1, mb: 6 }}>
      <FieldSet>
        <Legend>
          <Trans>Aave Protocol native asset</Trans>
        </Legend>
        {!reserve || ghoLoadingData ? (
          <GhoSkeleton />
        ) : (
          <ListItem sx={{ marginTop: -2, p: 0 }}>
            <ListColumn isRow maxWidth={190}>
              <Link
                href={ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket)}
                noWrap
                sx={{ display: 'inline-flex', alignItems: 'center' }}
              >
                <TokenIcon sx={{ fontSize: '40px' }} symbol="GHO" fontSize="inherit" />
                <Box sx={{ px: 3 }}>
                  <Typography variant="h3">GHO</Typography>
                </Box>
              </Link>
            </ListColumn>
            <ListColumn>
              <FormattedNumber compact symbol="usd" value="1" visibleDecimals={2} variant="h3" />
              <Typography variant="secondary12" color="text.secondary">
                <Trans>Price</Trans>
              </Typography>
            </ListColumn>
            <ListColumn>
              <FormattedNumber
                compact
                symbol="usd"
                value={ghoReserveData.aaveFacilitatorBucketLevel}
                visibleDecimals={2}
                variant="h3"
              />
              <Typography variant="secondary12" color="text.secondary">
                <Trans>Total borrowed</Trans>
              </Typography>
            </ListColumn>
            <ListColumn>
              <FormattedNumber
                compact
                value={ghoReserveData.aaveFacilitatorRemainingCapacity}
                visibleDecimals={2}
                variant="h3"
              />
              <Typography variant="secondary12" color="text.secondary">
                <Trans>Available to borrow</Trans>
              </Typography>
            </ListColumn>
            <ListColumn minWidth={195}>
              <GhoBorrowApyRange />
              <Typography variant="secondary12" color="text.secondary">
                <Trans>Borrow APY</Trans>
              </Typography>
            </ListColumn>
            <ListColumn maxWidth={95} /> {/* empty column for spacing */}
            <ListColumn minWidth={95} align="right">
              <Button
                variant="outlined"
                component={Link}
                href={ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket)}
              >
                <Trans>Details</Trans>
              </Button>
            </ListColumn>
          </ListItem>
        )}
      </FieldSet>
    </Box>
  );
};

const GhoSkeleton = () => {
  return (
    <ListItem sx={{ marginTop: -2, p: 0 }}>
      <ListColumn isRow maxWidth={190}>
        <Skeleton variant="circular" sx={{ minWidth: 40, maxWidth: 40 }} height={40} />
        <Box sx={{ px: 3 }}>
          <Skeleton width={75} height={24} />
        </Box>
      </ListColumn>
      <ListColumn>
        <Skeleton width={75} height={24} />
      </ListColumn>
      <ListColumn>
        <Skeleton width={70} height={24} />
      </ListColumn>
      <ListColumn>
        <Skeleton width={70} height={24} />
      </ListColumn>
      <ListColumn minWidth={195}>
        <Skeleton width={70} height={24} />
      </ListColumn>
      <ListColumn /> {/* empty column for spacing */}
      <ListColumn maxWidth={95} minWidth={95} align="right">
        <Skeleton width={74} height={38} />
      </ListColumn>
    </ListItem>
  );
};
