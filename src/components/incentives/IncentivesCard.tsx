import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Box, useMediaQuery } from '@mui/material';
import { ReactNode } from 'react';

import { FormattedNumber } from '../primitives/FormattedNumber';
import { NoData } from '../primitives/NoData';
import {
  IncentivesButton,
  MeritIncentivesButton,
  ZkIgniteIncentivesButton,
} from './IncentivesButton';

interface IncentivesCardProps {
  symbol: string;
  value: string | number;
  incentives?: ReserveIncentiveResponse[];
  address?: string;
  variant?: 'main14' | 'main16' | 'secondary14';
  symbolsVariant?: 'secondary14' | 'secondary16';
  align?: 'center' | 'flex-end' | 'start';
  color?: string;
  tooltip?: ReactNode;
  market: string;
  protocolAction?: ProtocolAction;
}

const hasIncentivesCheck = (incentives: IncentivesCardProps) => {
  const lmIncentives = IncentivesButton({
    symbol: incentives.symbol,
    incentives: incentives.incentives,
  });
  const meritIncentives = MeritIncentivesButton({
    symbol: incentives.symbol,
    market: incentives.market,
    protocolAction: incentives.protocolAction,
  });
  const zkIgniteIncentives = ZkIgniteIncentivesButton({
    market: incentives.market,
    rewardedAsset: incentives.address,
    protocolAction: incentives.protocolAction,
  });
  if (lmIncentives || meritIncentives || zkIgniteIncentives) {
    return true;
  } else {
    return false;
  }
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
  } = incentivesCardProps;

  const isTableChangedToCards = useMediaQuery('(max-width:1125px)');
  const hasIncentives = hasIncentivesCheck(incentivesCardProps);

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
      <Box
        sx={
          isTableChangedToCards
            ? { display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' }
            : {
                display: 'flex',
                justifyContent: 'center',
                gap: '4px',
                flexWrap: 'wrap',
                flex: '0 0 50%', // 2 items per row
              }
        }
      >
        <IncentivesButton incentives={incentives} symbol={symbol} displayBlank={!hasIncentives} />
        <MeritIncentivesButton symbol={symbol} market={market} protocolAction={protocolAction} />
        <ZkIgniteIncentivesButton
          market={market}
          rewardedAsset={address}
          protocolAction={protocolAction}
        />
      </Box>
    </Box>
  );
};
