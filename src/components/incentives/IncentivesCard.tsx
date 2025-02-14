import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Box, useMediaQuery } from '@mui/material';
import { ReactNode, useState } from 'react';

import { ContentWithTooltip } from '../ContentWithTooltip';
import { FormattedNumber } from '../primitives/FormattedNumber';
import { NoData } from '../primitives/NoData';
import {
  Content,
  IncentivesButton,
  MeritIncentivesButton,
  NoAprExternalIncentiveTooltip,
  useAllIncentives,
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
  isInModal?: boolean;
  displayBlank?: boolean;
  displayNone?: boolean;
}

export const IncentivesBox = ({
  symbol,
  incentives,
  address,
  market,
  protocolAction,
  isInModal,
  displayBlank,
}: IncentivesBoxProps) => {
  const isTableChangedToCards = useMediaQuery('(max-width:1125px)');

  const { allIncentives, totalApr } = useAllIncentives(
    {
      symbol,
      market,
      protocolAction,
    },
    incentives
  );

  const Incentives = () => (
    <Box
      sx={
        isTableChangedToCards && !isInModal
          ? {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '4px',
            }
          : {
              display: 'flex',
              justifyContent: 'center',
              gap: '4px',
              flexWrap: 'wrap',
              flex: '0 0 50%', // 2 items per row
              width: isInModal ? 'min-content' : 'auto', // 1 item per row in modal mode
            }
      }
    >
      <IncentivesButton
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
        tooltipContent={<Incentives />}
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

  return allIncentives.length >= 2 ? (
    <AllIncentivesButton />
  ) : allIncentives.length === 1 ? (
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
