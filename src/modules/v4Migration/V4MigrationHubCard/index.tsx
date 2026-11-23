import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Skeleton, Typography } from '@mui/material';
import { AssetGroup } from 'src/components/AssetGroup';
import { ChainBadge } from 'src/components/ChainBadge';
import { SparklineDatum } from 'src/components/charts/SparklineChart';
import { HubMarketIcon } from 'src/components/HubMarketIcon';
import { IncentivesIcon } from 'src/components/icons/IncentivesIcon';
import { OpportunityCard } from 'src/components/OpportunityCard';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { StatRow } from 'src/components/StatRow';
import { figVars } from 'src/utils/figmaColors';

import { getAssetIconSymbol } from '../V4MigrationPage/utils/positions';
import { MigrationAsset } from '../V4MigrationPage/utils/types';

export interface V4MigrationHubCardProps {
  hubName: string;
  chainId: ChainId;
  apy: number;
  apyAverage?: number;
  apyHistory?: SparklineDatum[];
  hasIncentives?: boolean;
  totalDepositsUSD: number;
  backingCollateral: MigrationAsset[];
  bestApy?: boolean;
  unavailable?: boolean;
  loading?: boolean;
  href?: string;
  onClick?: () => void;
}

export const V4MigrationHubCard = ({
  hubName,
  chainId,
  apy,
  apyAverage,
  apyHistory,
  hasIncentives = false,
  totalDepositsUSD,
  backingCollateral,
  bestApy = false,
  unavailable = false,
  loading,
  href,
  onClick,
}: V4MigrationHubCardProps) => {
  const name = hubName.replace(/\s+hub$/i, '');
  const averageLabel = <Trans>7D avg.</Trans>;

  return (
    <OpportunityCard
      title={<Trans>{name} Hub</Trans>}
      leading={
        <ChainBadge chainId={chainId} size={24}>
          <HubMarketIcon kind="hub" size={24} />
        </ChainBadge>
      }
      trailing={
        bestApy && !loading ? (
          <Typography
            variant="h5"
            component="span"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.125rem',
              p: '0.1875rem 0.5625rem',
              borderRadius: '2rem',
              bgcolor: 'migration-best-apy-bg',
              color: 'migration-best-apy',
            }}
          >
            <Trans>Best APY</Trans>
          </Typography>
        ) : undefined
      }
      href={href}
      onClick={onClick}
      disabled={unavailable}
      loading={loading}
      apyLabel={<Trans>Earn APY</Trans>}
      apy={
        <>
          <FormattedNumber value={apy} percent variant="inherit" />
          {hasIncentives && <IncentivesIcon />}
        </>
      }
      apyAverage={
        loading ? (
          <Skeleton
            variant="rectangular"
            width={88}
            height="1rem"
            sx={{ borderRadius: '0.375rem' }}
          />
        ) : apyAverage !== undefined ? (
          <>
            {averageLabel}
            <FormattedNumber value={apyAverage} percent variant="inherit" />
          </>
        ) : undefined
      }
      history={apyHistory}
      historyBaselineLabel={averageLabel}
      historyFadeLeft
      chartColor={figVars['data-purple']}
    >
      <StatRow
        label={<Trans>Total deposits</Trans>}
        description={<Trans>Total amount deposited for this asset</Trans>}
        loading={loading}
      >
        <FormattedNumber value={totalDepositsUSD} symbol="USD" compact variant="inherit" />
      </StatRow>
      <StatRow
        label={<Trans>New Backing Collateral</Trans>}
        description={
          <Trans>Collateral assets that share liquidity and risk within the {name} Hub</Trans>
        }
        loading={loading}
        empty={backingCollateral.length === 0}
      >
        <AssetGroup symbols={backingCollateral.map(getAssetIconSymbol)} size={20} />
      </StatRow>
    </OpportunityCard>
  );
};
