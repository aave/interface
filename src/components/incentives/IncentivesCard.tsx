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
  EthenaIncentivesButton,
  LmIncentivesButton,
  MeritIncentivesButton,
  NoAprExternalIncentiveTooltip,
  SonicIncentivesButton,
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

export const IncentivesBox = ({
  symbol,
  incentives,
  address,
  market,
  protocolAction,
  displayBlank,
}: IncentivesBoxProps) => {
  const { allIncentives, totalApr, incentivesCount } = useAllIncentives({
    symbol,
    market,
    rewardedAsset: address,
    protocolAction,
    lmIncentives: incentives,
  });

  const Incentives = () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: '4px',
        flexWrap: 'wrap',
        width: 'fit-content',
      }}
    >
      <LmIncentivesButton
        incentives={incentives}
        symbol={symbol}
        displayBlank={displayBlank && allIncentives.length == 0}
      />
      <MeritIncentivesButton symbol={symbol} market={market} protocolAction={protocolAction} />
      <ZkIgniteIncentivesButton
        market={market}
        rewardedAsset={address}
        protocolAction={protocolAction}
      />
      <EthenaIncentivesButton rewardedAsset={address} />
      <SonicIncentivesButton rewardedAsset={address} />
      <NoAprExternalIncentiveTooltip
        market={market}
        symbol={symbol}
        protocolAction={protocolAction}
      />
    </Box>
  );

  const AllIncentivesButton = () => {
    const [open, setOpen] = useState(false);

    return (
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
              <Incentives />
            </Box>
          </Box>
        }
        withoutHover
        setOpen={setOpen}
        open={open}
      >
        <Content
          incentives={allIncentives}
          incentivesNetAPR={totalApr}
          displayBlank={displayBlank}
        />
      </ContentWithTooltip>
    );
  };

  return incentivesCount >= 2 ? (
    <AllIncentivesButton />
  ) : incentivesCount === 1 ? (
    <Incentives />
  ) : null;
};

export const IncentivesCard = (incentivesCardProps: IncentivesCardProps) => {
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
      <IncentivesBox
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
