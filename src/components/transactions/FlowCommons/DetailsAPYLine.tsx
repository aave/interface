import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Trans } from '@lingui/macro';
import { Box, Skeleton, Typography } from '@mui/material';
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

interface DetailsAPYLineProps {
  symbol: string;
  market: string;
  protocolAction?: ProtocolAction;
  protocolAPY: number;
  incentives?: ReserveIncentiveResponse[];
  address?: string;
  loading?: boolean;
}

export const DetailsAPYLine = ({
  symbol,
  market,
  protocolAction,
  protocolAPY,
  incentives = [],
  address,
  loading = false,
}: DetailsAPYLineProps) => {
  const boostedData = useBoostedAPY({
    symbol,
    market,
    protocolAction,
    protocolAPY,
    incentives,
    address,
  });

  const { displayAPY, hasIncentives } = boostedData;

  // Create incentive buttons
  const incentivesContent = (
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

  return (
    <Row caption={<Trans>APY</Trans>} captionVariant="description" mb={4}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
        {loading ? (
          <Skeleton variant="rectangular" height={20} width={100} sx={{ borderRadius: '4px' }} />
        ) : (
          <>
            {displayAPY === 'Infinity' ? (
              <Typography variant="secondary14">∞ %</Typography>
            ) : (
              <FormattedNumber value={displayAPY} percent variant="secondary14" />
            )}
            {hasIncentives && incentivesContent}
          </>
        )}
      </Box>
    </Row>
  );
};
