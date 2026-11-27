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

const MAX_BACKING_COLLATERAL = 4;

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
  /** The 7-day figures are still on their way; the rest of the card is shown. */
  historyLoading?: boolean;
  href?: string;
  onClick?: () => void;
}

/** The hub's own figures are optional: a dash is shown for the ones left out. */
interface EarnProps extends CommonProps {
  side?: 'earn';
  totalDepositsUSD?: number;
  backingCollateral?: MigrationAsset[];
}

/** `hubName` may be empty here: the market is the title, and the hub line is then left out. */
interface BorrowProps extends CommonProps {
  side: 'borrow';
  marketName: string;
  /** The hubs the market draws from, when there can be more than one. Used instead of `hubName`. */
  hubNames?: string[];
  /** Leave out when there is none to report: a dash is shown. */
  healthFactor?: string;
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
    historyLoading,
    href,
    onClick,
  } = props;
  const borrow = props.side === 'borrow';
  const name = getHubDisplayName(hubName);
  const market = borrow ? getMarketDisplayName(props.marketName) : undefined;
  const hubs = borrow
    ? (props.hubNames ?? (name ? [name] : [])).map(getHubDisplayName).join(', ')
    : '';
  const hubCount = borrow ? props.hubNames?.length ?? 1 : 0;
  const hubLine = !hubs ? undefined : hubCount > 1 ? (
    <Trans>{hubs} Hubs</Trans>
  ) : (
    <Trans>{hubs} Hub</Trans>
  );
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
      subtitle={hubLine}
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
        loading || historyLoading ? (
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
      historyLoading={historyLoading}
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
          {props.healthFactor === undefined ? (
            '—'
          ) : (
            <HealthFactorNumber
              value={props.healthFactor}
              variant="inherit"
              withHeart
              heartGap="0.375rem"
            />
          )}
        </StatRow>
      ) : (
        <>
          <StatRow
            label={<Trans>Total deposits</Trans>}
            description={<Trans>Total amount deposited for this asset</Trans>}
            loading={loading}
            empty={props.totalDepositsUSD === undefined}
          >
            <FormattedNumber
              value={props.totalDepositsUSD ?? 0}
              symbol="USD"
              compact
              variant="inherit"
            />
          </StatRow>
          <StatRow
            label={<Trans>New Backing Collateral</Trans>}
            description={
              name ? (
                <Trans>Collateral assets that share liquidity and risk within the {name} Hub</Trans>
              ) : (
                <Trans>Collateral assets that share liquidity and risk within the hub</Trans>
              )
            }
            loading={loading}
            empty={!props.backingCollateral?.length}
          >
            <AssetGroup
              symbols={(props.backingCollateral ?? []).map(getAssetIconSymbol)}
              max={MAX_BACKING_COLLATERAL}
              size={20}
            />
          </StatRow>
        </>
      )}
    </OpportunityCard>
  );
};
