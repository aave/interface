import { Stake } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button, Skeleton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { useModalContext } from 'src/hooks/useModal';
import { useSGhoVaultContext } from 'src/modules/sGho/SGhoVaultContext';
import { useRootStore } from 'src/store/root';

/**
 * Whether the connected user has any legacy stkGHO (formerly "sGHO") staked.
 * Used to switch the markets-page banner between the migration prompt and
 * the new-user "Earn into sGHO" prompt.
 */
const useHasLegacyStkGhoPosition = () => {
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const { data: stakeUserResult } = useUserStakeUiData(currentMarketData, Stake.gho);
  const stkGhoRedeemable = stakeUserResult?.[0]?.stakeTokenRedeemableAmount;
  return !!stkGhoRedeemable && stkGhoRedeemable !== '0';
};

export const SavingsGhoBanner = () => {
  const theme = useTheme();
  const isCustomBreakpoint = useMediaQuery('(min-width:1125px)');
  const isMd = useMediaQuery(theme.breakpoints.up('xs'));
  const isMd2 = useMediaQuery(theme.breakpoints.up('md'));
  const downToMd = useMediaQuery('(min-width:870px)');
  const downToSm = useMediaQuery('(max-width:780px)');

  const { openStkGhoMigrate } = useModalContext();
  const { vault, loading: vaultLoading } = useSGhoVaultContext();
  const totalDepositedUSD = vault?.totalAssets.usd ?? '0';
  const targetRate = vault?.targetRate ? +vault.targetRate.value : 0;
  const hasLegacyPosition = useHasLegacyStkGhoPosition();

  if (downToSm) {
    return <GhoSavingsBannerMobile hasLegacyPosition={hasLegacyPosition} />;
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
            {hasLegacyPosition ? (
              <Trans>Migrate your sGHO position</Trans>
            ) : (
              <Trans>Earn into sGHO</Trans>
            )}
          </Typography>
          <Typography
            sx={(theme) => ({
              [theme.breakpoints.up(1125)]: { typography: 'description' },
              typography: { xs: 'caption' },
            })}
            color="text.secondary"
          >
            {hasLegacyPosition ? (
              <Trans>To continue claiming rewards, migrate now.</Trans>
            ) : (
              <Trans>GHO yield with instant withdraws.</Trans>
            )}
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
            {vaultLoading ? (
              <Skeleton width={70} height={25} />
            ) : (
              <Stack direction="row" gap={1} alignItems="center">
                <FormattedNumber
                  symbol="USD"
                  compact
                  variant={isCustomBreakpoint ? 'h3' : isMd ? 'secondary16' : 'secondary14'}
                  value={totalDepositedUSD}
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
          {vaultLoading ? (
            <Skeleton width={70} height={25} />
          ) : (
            <Stack direction="row" gap={1} alignItems="center">
              <FormattedNumber
                percent
                variant={isCustomBreakpoint ? 'h3' : isMd ? 'secondary16' : 'secondary14'}
                value={targetRate}
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
        <Stack
          direction="row"
          gap={2}
          sx={{
            mr: 8,
            ml: isMd2 ? 12 : 0,
          }}
        >
          <Button variant="outlined" component={Link} size="medium" href={ROUTES.sGHO}>
            <Trans>View details</Trans>
          </Button>
          <Button
            variant="contained"
            component={Link}
            size="medium"
            href={ROUTES.sGHO}
            onClick={() => {
              if (hasLegacyPosition) openStkGhoMigrate();
            }}
          >
            {hasLegacyPosition ? <Trans>Migrate</Trans> : <Trans>Start Earning</Trans>}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

const GhoSavingsBannerMobile = ({ hasLegacyPosition }: { hasLegacyPosition: boolean }) => {
  const { openStkGhoMigrate } = useModalContext();
  const { vault, loading: vaultLoading } = useSGhoVaultContext();
  const totalDepositedUSD = vault?.totalAssets.usd ?? '0';
  const targetRate = vault?.targetRate ? +vault.targetRate.value : 0;

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
              {hasLegacyPosition ? (
                <Trans>Migrate your sGHO position</Trans>
              ) : (
                <Trans>Earn into sGHO</Trans>
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {hasLegacyPosition ? (
                <Trans>To continue claiming rewards, migrate now.</Trans>
              ) : (
                <Trans>GHO yield with instant withdraws.</Trans>
              )}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" gap={4}>
            <TokenIcon symbol="sgho" sx={{ fontSize: '38px' }} />
            <Stack direction="column" alignItems="flex-start">
              {vaultLoading ? (
                <Skeleton width={70} height={25} />
              ) : (
                <Stack direction="row" gap={1} alignItems="center">
                  <FormattedNumber
                    symbol="USD"
                    compact
                    variant="secondary14"
                    value={totalDepositedUSD}
                  />
                </Stack>
              )}
              <Typography variant="caption" color="text.secondary" noWrap>
                <Trans>Total deposited</Trans>
              </Typography>
            </Stack>
            <Stack>
              {vaultLoading ? (
                <Skeleton width={70} height={25} />
              ) : (
                <Stack direction="row" gap={1} alignItems="center">
                  <FormattedNumber percent variant="secondary14" value={targetRate} />
                </Stack>
              )}
              <Typography variant="caption" color="text.secondary" noWrap>
                <Trans>APY</Trans>
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" gap={2}>
            <Button variant="outlined" fullWidth component={Link} size="medium" href={ROUTES.sGHO}>
              <Trans>View details</Trans>
            </Button>
            <Button
              variant="contained"
              fullWidth
              component={Link}
              size="medium"
              href={ROUTES.sGHO}
              onClick={() => {
                if (hasLegacyPosition) openStkGhoMigrate();
              }}
            >
              {hasLegacyPosition ? <Trans>Migrate</Trans> : <Trans>Start Earning</Trans>}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
