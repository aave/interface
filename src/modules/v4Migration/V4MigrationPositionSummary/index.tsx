import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Skeleton, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { ChainBadge } from 'src/components/ChainBadge';
import { HealthFactorNumber } from 'src/components/HealthFactorNumber';
import { HubMarketIcon } from 'src/components/HubMarketIcon';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TitleWithSubtitle } from 'src/components/TitleWithSubtitle';
import { CARD_SURFACE_SX } from 'src/utils/figmaColors';

import { getMarketDisplayName } from '../V4MigrationPage/utils/positions';

export interface V4MigrationPositionSummaryProps {
  chainId: ChainId;
  marketName: string;
  balanceUSD: number;
  apy: number;
  apyAverage?: number;
  healthFactor: string;
  loading?: boolean;
}

const VALUE_SKELETON = (
  <Skeleton variant="rectangular" width={88} height="1.35rem" sx={{ borderRadius: '0.375rem' }} />
);

const AVERAGE_SKELETON = (
  <Skeleton variant="rectangular" width={88} height="1rem" sx={{ borderRadius: '0.375rem' }} />
);

const Stat = ({
  label,
  value,
  secondary,
  loading,
}: {
  label: ReactNode;
  value: ReactNode;
  secondary?: ReactNode;
  loading?: boolean;
}) => (
  <Box sx={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <Typography variant="base" color="fg-3" noWrap>
      {label}
    </Typography>
    <Typography
      variant="h3"
      color="fg-1"
      component="div"
      sx={{ display: 'flex', alignItems: 'center', minHeight: '1.35rem' }}
    >
      {loading ? VALUE_SKELETON : value}
    </Typography>
    {secondary ? (
      <Typography
        variant="caption"
        color="fg-3"
        component="div"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          letterSpacing: 0,
          lineHeight: 1.35,
        }}
      >
        {secondary}
      </Typography>
    ) : null}
  </Box>
);

const Divider = () => (
  <Box
    sx={{
      alignSelf: 'stretch',
      flexShrink: 0,
      width: { xs: 'auto', xsm: '1px' },
      height: { xs: '1px', xsm: 'auto' },
      bgcolor: 'border-0',
    }}
  />
);

export const V4MigrationPositionSummary = ({
  chainId,
  marketName,
  balanceUSD,
  apy,
  apyAverage,
  healthFactor,
  loading,
}: V4MigrationPositionSummaryProps) => {
  const market = getMarketDisplayName(marketName);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
        <ChainBadge chainId={chainId} size={24}>
          <HubMarketIcon kind="market" size={24} />
        </ChainBadge>
        <TitleWithSubtitle
          title={<Trans>V3 Protocol</Trans>}
          subtitle={<Trans>{market} Market</Trans>}
        />
      </Box>
      <Box
        sx={{
          ...CARD_SURFACE_SX,
          display: 'flex',
          flexDirection: { xs: 'column', xsm: 'row' },
          gap: '1rem',
          p: '1rem 1.5rem',
        }}
      >
        <Stat
          label={<Trans>Balance</Trans>}
          value={<FormattedNumber value={balanceUSD} symbol="USD" compact variant="inherit" />}
          loading={loading}
        />
        <Divider />
        <Stat
          label={<Trans>Position APY</Trans>}
          value={<FormattedNumber value={apy} percent variant="inherit" />}
          secondary={
            loading ? (
              AVERAGE_SKELETON
            ) : apyAverage !== undefined ? (
              <>
                <Trans>7D avg.</Trans>
                <FormattedNumber value={apyAverage} percent variant="inherit" />
              </>
            ) : undefined
          }
          loading={loading}
        />
        <Divider />
        <Stat
          label={<Trans>Health Factor</Trans>}
          value={
            <HealthFactorNumber
              value={healthFactor}
              variant="inherit"
              withHeart
              heartGap="0.375rem"
              sx={{ color: 'inherit' }}
            />
          }
          loading={loading}
        />
      </Box>
    </Box>
  );
};
