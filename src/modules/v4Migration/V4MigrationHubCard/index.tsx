import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Skeleton, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { AssetGroup } from 'src/components/AssetGroup';
import { ChainBadge } from 'src/components/ChainBadge';
import { SparklineDatum } from 'src/components/charts/SparklineChart';
import { ContentWithTooltip } from 'src/components/ContentWithTooltip';
import { Curator } from 'src/components/CuratorBy';
import { HealthFactorNumber } from 'src/components/HealthFactorNumber';
import { HubMarketIcon } from 'src/components/HubMarketIcon';
import { IncentivesIcon } from 'src/components/icons/IncentivesIcon';
import { OpportunityCard } from 'src/components/OpportunityCard';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { StatRow } from 'src/components/StatRow';
import { dottedUnderlineSx, figVars } from 'src/utils/figmaColors';

import {
  getAssetIconSymbol,
  getHubDisplayName,
  getMarketDisplayName,
} from '../V4MigrationPage/utils/positions';
import { MigrationAsset } from '../V4MigrationPage/utils/types';

interface CommonProps {
  hubName: string;
  chainId: ChainId;
  curators?: Curator[];
  apy: number;
  apyTooltip?: ReactNode;
  apyAverage?: number;
  apyHistory?: SparklineDatum[];
  hasIncentives?: boolean;
  bestApy?: boolean;
  unavailable?: boolean;
  loading?: boolean;
  href?: string;
  onClick?: () => void;
}

interface EarnProps extends CommonProps {
  side?: 'earn';
  totalDepositsUSD: number;
  backingCollateral: MigrationAsset[];
}

interface BorrowProps extends CommonProps {
  side: 'borrow';
  marketName: string;
  healthFactor: string;
}

export type V4MigrationHubCardProps = EarnProps | BorrowProps;

export const V4MigrationHubCard = (props: V4MigrationHubCardProps) => {
  const {
    hubName,
    chainId,
    curators,
    apy,
    apyTooltip,
    apyAverage,
    apyHistory,
    hasIncentives = false,
    bestApy = false,
    unavailable = false,
    loading,
    href,
    onClick,
  } = props;
  const borrow = props.side === 'borrow';
  const name = getHubDisplayName(hubName);
  const market = borrow ? getMarketDisplayName(props.marketName) : undefined;
  const averageLabel = <Trans>7D avg.</Trans>;
  const rate = <FormattedNumber value={apy} percent variant="inherit" />;

  const apyText = (
    <Box
      component="span"
      sx={{
        whiteSpace: 'nowrap',
        ...(apyTooltip ? { position: 'relative', zIndex: 2, ...dottedUnderlineSx } : {}),
      }}
    >
      {borrow ? <Trans>Up to {rate}</Trans> : rate}
    </Box>
  );

  return (
    <OpportunityCard
      title={borrow ? <Trans>{market} Market</Trans> : <Trans>{name} Hub</Trans>}
      subtitle={borrow ? <Trans>{name} Hub</Trans> : undefined}
      curators={curators}
      leading={
        <ChainBadge chainId={chainId} size={24}>
          <HubMarketIcon kind={borrow ? 'market' : 'hub'} size={24} />
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
            {borrow ? <Trans>Cheapest APY</Trans> : <Trans>Best APY</Trans>}
          </Typography>
        ) : undefined
      }
      href={href}
      onClick={onClick}
      disabled={unavailable}
      loading={loading}
      apyLabel={borrow ? <Trans>Position APY</Trans> : <Trans>Earn APY</Trans>}
      apy={
        <>
          {apyTooltip ? (
            <ContentWithTooltip tooltipContent={<>{apyTooltip}</>}>{apyText}</ContentWithTooltip>
          ) : (
            apyText
          )}
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
      chartColor={figVars[borrow ? 'data-orange' : 'data-purple']}
    >
      {borrow ? (
        <StatRow
          label={<Trans>Health factor</Trans>}
          description={
            <Trans>
              A ratio of your total collateral value to total debt. Below 1.0, your position can be
              liquidated.
            </Trans>
          }
          loading={loading}
        >
          <HealthFactorNumber
            value={props.healthFactor}
            variant="inherit"
            withHeart
            heartGap="0.375rem"
          />
        </StatRow>
      ) : (
        <>
          <StatRow
            label={<Trans>Total deposits</Trans>}
            description={<Trans>Total amount deposited for this asset</Trans>}
            loading={loading}
          >
            <FormattedNumber
              value={props.totalDepositsUSD}
              symbol="USD"
              compact
              variant="inherit"
            />
          </StatRow>
          <StatRow
            label={<Trans>New Backing Collateral</Trans>}
            description={
              <Trans>Collateral assets that share liquidity and risk within the {name} Hub</Trans>
            }
            loading={loading}
            empty={props.backingCollateral.length === 0}
          >
            <AssetGroup symbols={props.backingCollateral.map(getAssetIconSymbol)} size={20} />
          </StatRow>
        </>
      )}
    </OpportunityCard>
  );
};
