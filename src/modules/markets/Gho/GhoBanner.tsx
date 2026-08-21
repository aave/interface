import { Stake } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button, Skeleton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { useSGhoVaultContext } from 'src/modules/sGho/SGhoVaultContext';
import { useRootStore } from 'src/store/root';
import { figVars } from 'src/utils/figmaColors';

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

/**
 * Shared card surface (radius, hairline border, green→neutral tint gradient, soft shadow) for both
 * banner variants — the diverging layout (row/6rem vs column/188px) is applied per variant on top.
 */
const BANNER_SURFACE_SX = {
  borderRadius: '0.75rem',
  border: '1px solid',
  borderColor: 'border-1',
  backgroundColor: figVars['table-bg'],
  backgroundImage: `linear-gradient(90deg, ${figVars['sgho-banner-green']} 0%, transparent 42.79%)`,
  boxShadow: `0px 2px 4px 0px ${figVars['shadow-low']}`,
  position: 'relative',
} as const;

/** Title + subtitle, shared by the desktop and mobile banner variants. */
const SavingsGhoBannerHeading = ({ hasLegacyPosition }: { hasLegacyPosition: boolean }) => (
  <Stack direction="column" gap="0.37rem">
    <Typography
      variant="h2"
      sx={{
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 'normal',
        letterSpacing: '-0.02063rem',
        fontFeatureSettings: "'cv11' on",
        color: 'fg-1',
      }}
    >
      {hasLegacyPosition ? (
        <Trans>Migrate your sGHO position</Trans>
      ) : (
        <Trans>Earn into sGHO</Trans>
      )}
    </Typography>
    <Typography
      variant="description"
      sx={{ lineHeight: '100%', letterSpacing: 'normal' }}
      color="fg-3"
    >
      {hasLegacyPosition ? (
        <Trans>To continue claiming rewards, migrate now.</Trans>
      ) : (
        <Trans>GHO yield with instant withdraws.</Trans>
      )}
    </Typography>
  </Stack>
);

/** One labelled stat (label above value), shared by both variants; shows a skeleton while loading. */
const BannerStat = ({
  label,
  loading,
  children,
}: {
  label: ReactNode;
  loading: boolean;
  children: ReactNode;
}) => (
  <Stack direction="column" alignItems="flex-start" gap="0.25rem">
    <Typography variant="description" color="fg-3" noWrap>
      {label}
    </Typography>
    {loading ? <Skeleton width={70} height={25} /> : children}
  </Stack>
);

export const SavingsGhoBanner = ({
  hasLegacyPositionOverride,
}: {
  /**
   * Showcase/dev only: force the legacy ("Migrate your sGHO position") vs default ("Earn into
   * sGHO") copy, bypassing wallet-based detection so /dev/components can show both states.
   */
  hasLegacyPositionOverride?: boolean;
} = {}) => {
  const theme = useTheme();
  const downToSm = useMediaQuery(theme.breakpoints.down('sm'));

  const { vault, loading: vaultLoading } = useSGhoVaultContext();
  const totalDepositedUSD = vault?.totalAssets.usd ?? '0';
  const targetRate = vault?.targetRate ? +vault.targetRate.value : 0;
  const detectedLegacyPosition = useHasLegacyStkGhoPosition();
  const hasLegacyPosition = hasLegacyPositionOverride ?? detectedLegacyPosition;

  if (downToSm) {
    return <GhoSavingsBannerMobile hasLegacyPosition={hasLegacyPosition} />;
  }

  return (
    <Stack
      component={Link}
      href={ROUTES.sGHO}
      sx={{
        ...BANNER_SURFACE_SX,
        mt: 5,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        height: '6rem',
        padding: '1.25rem 2rem 1.25rem 1.5rem',
        overflow: 'hidden',
      }}
    >
      <Stack direction="row" alignItems="center" gap="1.5rem">
        <Box
          component="img"
          src="/gho-coins.png"
          alt="GHO coins"
          sx={{ height: '3.5rem', flexShrink: 0 }}
        />
        <SavingsGhoBannerHeading hasLegacyPosition={hasLegacyPosition} />
      </Stack>
      <BannerStat label={<Trans>Total deposited</Trans>} loading={vaultLoading}>
        <FormattedNumber symbol="USD" compact variant="h3" color="fg-1" value={totalDepositedUSD} />
      </BannerStat>
      <BannerStat label={<Trans>APY</Trans>} loading={vaultLoading}>
        <FormattedNumber percent variant="h3" color="fg-1" value={targetRate} />
      </BannerStat>
      <Stack direction="row" gap="0.62rem">
        <Button variant="tertiary" component={Link} size="medium" href={ROUTES.sGHO}>
          <Trans>View details</Trans>
        </Button>
      </Stack>
    </Stack>
  );
};

const GhoSavingsBannerMobile = ({ hasLegacyPosition }: { hasLegacyPosition: boolean }) => {
  const { vault, loading: vaultLoading } = useSGhoVaultContext();
  const totalDepositedUSD = vault?.totalAssets.usd ?? '0';
  const targetRate = vault?.targetRate ? +vault.targetRate.value : 0;

  return (
    <Stack
      component={Link}
      href={ROUTES.sGHO}
      sx={{
        ...BANNER_SURFACE_SX,
        mt: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        height: '188px',
        gap: { xs: 6 },
      }}
    >
      <Box
        component="img"
        src="/gho-coins.png"
        alt="GHO coins"
        sx={{ position: 'absolute', height: '100px', top: -8, right: 8 }}
      />
      <Stack
        direction="column"
        sx={{ width: '100%', height: '100%', padding: '16px' }}
        justifyContent="space-between"
      >
        <SavingsGhoBannerHeading hasLegacyPosition={hasLegacyPosition} />
        <Stack direction="row" alignItems="center" gap={4}>
          <BannerStat label={<Trans>Total deposited</Trans>} loading={vaultLoading}>
            <FormattedNumber
              symbol="USD"
              compact
              variant="h3"
              color="fg-1"
              value={totalDepositedUSD}
            />
          </BannerStat>
          <BannerStat label={<Trans>APY</Trans>} loading={vaultLoading}>
            <FormattedNumber percent variant="h3" color="fg-1" value={targetRate} />
          </BannerStat>
        </Stack>
        <Stack direction="row" gap="0.62rem">
          <Button variant="tertiary" fullWidth component={Link} size="medium" href={ROUTES.sGHO}>
            <Trans>View details</Trans>
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
