import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { ReactNode, useState } from 'react';
import { useAllIncentives } from 'src/hooks/useAllIncentives';

import { ContentWithTooltip } from '../ContentWithTooltip';
import { FormattedNumber } from '../primitives/FormattedNumber';
import { NoData } from '../primitives/NoData';
import {
  Content,
  LmIncentivesButton,
  MeritIncentivesButton,
  PointsIncentiveButton,
  SimpleExternalIncentiveTooltip,
  ZkIgniteIncentivesButton,
} from './IncentivesButton';

interface IncentivesCardProps {
  symbol: string;
  value: string | number;
  market: string;
  incentives?: ReserveIncentiveResponse[];
  address?: string;
  variant?: 'main14' | 'main16' | 'secondary14';
  symbolsVariant?: 'secondary14' | 'secondary16';
  align?: 'center' | 'flex-end' | 'start';
  color?: string;
  tooltip?: ReactNode;
  protocolAction?: ProtocolAction;
  displayBlank?: boolean;
}

interface IncentivesBoxProps {
  symbol: string;
  market: string;
  incentives?: ReserveIncentiveResponse[];
  address?: string;
  protocolAction?: ProtocolAction;
  displayBlank?: boolean;
  displayNone?: boolean;
}

export const IncentivesCard = ({
  symbol,
  incentives,
  address,
  market,
  protocolAction,
  displayBlank,
}: IncentivesBoxProps) => {
  const { allAprsIncentives, totalApr, allIncentivesCount, allAprsIncentivesCount } =
    useAllIncentives({
      symbol,
      market,
      rewardedAsset: address,
      protocolAction,
      lmIncentives: incentives,
    });

  const Incentives = ({ hasMultipleIncentives }: { hasMultipleIncentives: boolean }) => (
    <Box
      sx={{
        display: 'flex',
        gap: '4px',
      }}
    >
      <>
        <LmIncentivesButton
          incentives={incentives}
          symbol={symbol}
          displayBlank={displayBlank && allAprsIncentives.length == 0}
        />
        <MeritIncentivesButton symbol={symbol} market={market} protocolAction={protocolAction} />
        <ZkIgniteIncentivesButton
          market={market}
          rewardedAsset={address}
          protocolAction={protocolAction}
        />
      </>
      {!hasMultipleIncentives ? (
        <>
          <PointsIncentiveButton market={market} rewardedAsset={address} />
          <SimpleExternalIncentiveTooltip market={market} rewardedAsset={address} />
        </>
      ) : null}
    </Box>
  );

  const MultipleIncentives = () => {
    const [open, setOpen] = useState(false);

    return (
      <Box sx={{ display: 'flex', gap: '4px' }}>
        <ContentWithTooltip
          tooltipContent={
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Box>
                <Typography variant="caption" color="text.secondary" mb={3}>
                  <Trans>
                    Participating in this {symbol} reserve gives additional annualized rewards.
                  </Trans>
                </Typography>
              </Box>
              <Box>
                <Incentives hasMultipleIncentives={true} />
              </Box>
            </Box>
          }
          withoutHover
          setOpen={setOpen}
          open={open}
        >
          <Content
            incentives={allAprsIncentives}
            incentivesNetAPR={totalApr}
            displayBlank={displayBlank}
          />
        </ContentWithTooltip>
        <PointsIncentiveButton market={market} rewardedAsset={address} />
        <SimpleExternalIncentiveTooltip market={market} rewardedAsset={address} />
      </Box>
    );
  };

  const multipleIncentives = allAprsIncentivesCount >= 2;
  const singleIncentives = allIncentivesCount >= 1;

  return multipleIncentives ? (
    <MultipleIncentives />
  ) : singleIncentives ? (
    <Incentives hasMultipleIncentives={false} />
  ) : null;
};

export const RateAndIncentivesBox = (incentivesCardProps: IncentivesCardProps) => {
  const {
    symbol,
    value,
    incentives,
    address,
    variant = 'secondary14',
    symbolsVariant,
    align,
    color,
    tooltip,
    market,
    protocolAction,
    displayBlank,
  } = incentivesCardProps;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align || { xs: 'flex-end', xsm: 'center' },
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      {value.toString() !== '-1' ? (
        <Box sx={{ display: 'flex' }}>
          <FormattedNumber
            data-cy={`apy`}
            value={value}
            percent
            variant={variant}
            symbolsVariant={symbolsVariant}
            color={color}
            symbolsColor={color}
          />
          {tooltip}
        </Box>
      ) : (
        <NoData variant={variant} color={color || 'text.secondary'} />
      )}
      <IncentivesCard
        symbol={symbol}
        incentives={incentives}
        address={address}
        market={market}
        protocolAction={protocolAction}
        displayBlank={displayBlank}
      />
    </Box>
  );
};
