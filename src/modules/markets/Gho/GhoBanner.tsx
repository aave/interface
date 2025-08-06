import { Stake } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button, Skeleton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { useMeritIncentives } from 'src/hooks/useMeritIncentives';
import { useRootStore } from 'src/store/root';
import { GHO_SYMBOL } from 'src/utils/ghoUtilities';

export const SavingsGhoBanner = () => {
  const theme = useTheme();
  const isCustomBreakpoint = useMediaQuery('(min-width:1125px)');
  const isMd = useMediaQuery(theme.breakpoints.up('xs'));
  const isMd2 = useMediaQuery(theme.breakpoints.up('md'));
  const downToMd = useMediaQuery('(min-width:870px)');
  const downToSm = useMediaQuery('(max-width:780px)');

  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const { data: meritIncentives, isLoading: meritIncentivesLoading } = useMeritIncentives({
    symbol: GHO_SYMBOL,
    market: currentMarketData.market,
  });
  const { data: stakeGeneralResult, isLoading: stakeDataLoading } = useGeneralStakeUiData(
    currentMarketData,
    Stake.gho
  );

  const stakeData = stakeGeneralResult?.[0];

  if (downToSm) {
    return <GhoSavingsBannerMobile />;
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
        href={ROUTES.sGHO}
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
            {stakeDataLoading || !stakeData ? (
              <Skeleton width={70} height={25} />
            ) : (
              <Stack direction="row" gap={1} alignItems="center">
                <FormattedNumber
                  symbol="USD"
                  compact
                  variant={isCustomBreakpoint ? 'h3' : isMd ? 'secondary16' : 'secondary14'}
                  value={stakeData.totalSupplyFormatted || 0}
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
          href={ROUTES.sGHO}
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

const GhoSavingsBannerMobile = () => {
  const currentMarketData = useRootStore((store) => store.currentMarketData);
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
        href={ROUTES.sGHO}
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
          <Button variant="contained" fullWidth component={Link} size="medium" href={ROUTES.sGHO}>
            <Trans>View details</Trans>
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
