import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { ArrowNarrowRightIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Skeleton, SvgIcon, Typography } from '@mui/material';
import React from 'react';
import { useBoostedAPY } from 'src/hooks/useBoostedAPY';

import {
  EthenaIncentivesButton,
  EtherfiIncentivesButton,
  IncentivesButton,
  MeritIncentivesButton,
  MerklIncentivesButton,
  SonicIncentivesButton,
} from '../../incentives/IncentivesButton';
import { FormattedNumber } from '../../primitives/FormattedNumber';
import { Row } from '../../primitives/Row';

const ArrowRightIcon = (
  <SvgIcon color="primary" sx={{ fontSize: '14px', mx: 1 }}>
    <ArrowNarrowRightIcon />
  </SvgIcon>
);

interface DetailsAPYTransitionLineProps {
  // Current (from) asset
  symbol: string;
  market: string;
  protocolAction?: ProtocolAction;
  protocolAPY: number;
  incentives?: ReserveIncentiveResponse[];
  address?: string;

  // Future (to) asset
  futureSymbol: string;
  futureMarket: string;
  futureProtocolAPY: number;
  futureIncentives?: ReserveIncentiveResponse[];
  futureAddress?: string;

  loading?: boolean;
}

export const DetailsAPYTransitionLine = ({
  symbol,
  market,
  protocolAction,
  protocolAPY,
  incentives = [],
  address,
  futureSymbol,
  futureMarket,
  futureProtocolAPY,
  futureIncentives = [],
  futureAddress,
  loading = false,
}: DetailsAPYTransitionLineProps) => {
  // Calculate current boosted APY
  const currentData = useBoostedAPY({
    symbol,
    market,
    protocolAction,
    protocolAPY,
    incentives,
    address,
  });

  // Calculate future boosted APY
  const futureData = useBoostedAPY({
    symbol: futureSymbol,
    market: futureMarket,
    protocolAction,
    protocolAPY: futureProtocolAPY,
    incentives: futureIncentives,
    address: futureAddress,
  });

  // Create incentive buttons for current asset
  const currentIncentivesContent = (
    <>
      <IncentivesButton
        incentives={incentives}
        symbol={symbol}
        market={market}
        protocolAction={protocolAction}
        protocolAPY={protocolAPY}
        address={address}
      />
      <MeritIncentivesButton
        symbol={symbol}
        market={market}
        protocolAction={protocolAction}
        protocolAPY={protocolAPY}
        protocolIncentives={incentives}
      />
      <MerklIncentivesButton
        market={market}
        rewardedAsset={address}
        protocolAction={protocolAction}
        protocolAPY={protocolAPY}
        protocolIncentives={incentives}
      />
      <EthenaIncentivesButton rewardedAsset={address} />
      <EtherfiIncentivesButton symbol={symbol} market={market} protocolAction={protocolAction} />
      <SonicIncentivesButton rewardedAsset={address} />
    </>
  );

  // Create incentive buttons for future asset
  const futureIncentivesContent = (
    <>
      <IncentivesButton
        incentives={futureIncentives}
        symbol={futureSymbol}
        market={futureMarket}
        protocolAction={protocolAction}
        protocolAPY={futureProtocolAPY}
        address={futureAddress}
      />
      <MeritIncentivesButton
        symbol={futureSymbol}
        market={futureMarket}
        protocolAction={protocolAction}
        protocolAPY={futureProtocolAPY}
        protocolIncentives={futureIncentives}
      />
      <MerklIncentivesButton
        market={futureMarket}
        rewardedAsset={futureAddress}
        protocolAction={protocolAction}
        protocolAPY={futureProtocolAPY}
        protocolIncentives={futureIncentives}
      />
      <EthenaIncentivesButton rewardedAsset={futureAddress} />
      <EtherfiIncentivesButton
        symbol={futureSymbol}
        market={futureMarket}
        protocolAction={protocolAction}
      />
      <SonicIncentivesButton rewardedAsset={futureAddress} />
    </>
  );

  const showCurrentIncentives = currentData.hasIncentives;
  const showFutureIncentives = futureData.hasIncentives;

  return (
    <Row caption={<Trans>APY</Trans>} captionVariant="description" mb={4}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        {loading ? (
          <Skeleton variant="rectangular" height={20} width={100} sx={{ borderRadius: '4px' }} />
        ) : (
          <>
            {/* Current APY + Incentives */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {currentData.displayAPY === 'Infinity' ? (
                <Typography variant="secondary14">∞ %</Typography>
              ) : (
                <FormattedNumber value={currentData.displayAPY} percent variant="secondary14" />
              )}
              {showCurrentIncentives && currentIncentivesContent}
            </Box>

            {/* Arrow */}
            {ArrowRightIcon}

            {/* Future APY + Incentives */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {futureData.displayAPY === 'Infinity' ? (
                <Typography variant="secondary14">∞ %</Typography>
              ) : (
                <FormattedNumber value={futureData.displayAPY} percent variant="secondary14" />
              )}
              {showFutureIncentives && futureIncentivesContent}
            </Box>
          </>
        )}
      </Box>
    </Row>
  );
};
