import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Box } from '@mui/material';
import { ReactNode } from 'react';
import { useMeritIncentives } from 'src/hooks/useMeritIncentives';
import { useMerklIncentives } from 'src/hooks/useMerklIncentives';

import { FormattedNumber } from '../primitives/FormattedNumber';
import { NoData } from '../primitives/NoData';
import {
  EthenaIncentivesButton,
  EtherfiIncentivesButton,
  IncentivesButton,
  MeritIncentivesButton,
  MerklIncentivesButton,
  SonicIncentivesButton,
} from './IncentivesButton';

interface IncentivesCardProps {
  symbol: string;
  value: string | number;
  incentives?: ReserveIncentiveResponse[];
  address?: string;
  variant?: 'main14' | 'main16' | 'secondary14';
  symbolsVariant?: 'secondary14' | 'secondary16';
  color?: string;
  tooltip?: ReactNode;
  market: string;
  protocolAction?: ProtocolAction;
}

export const IncentivesCard = ({
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
}: IncentivesCardProps) => {
  const protocolAPY = typeof value === 'string' ? parseFloat(value) : value;

  const protocolIncentivesAPR =
    incentives?.reduce((sum, inc) => {
      return sum + (inc.incentiveAPR === 'Infinity' ? 0 : +inc.incentiveAPR);
    }, 0) || 0;

  const { data: meritIncentives } = useMeritIncentives({
    symbol,
    market,
    protocolAction,
    protocolAPY,
    protocolIncentives: incentives || [],
  });

  const { data: merklIncentives } = useMerklIncentives({
    market,
    rewardedAsset: address,
    protocolAction,
    protocolAPY,
    protocolIncentives: incentives || [],
  });

  const meritIncentivesAPR = meritIncentives?.breakdown?.meritIncentivesAPR || 0;
  const merklIncentivesAPR = merklIncentives?.breakdown?.merklIncentivesAPR || 0;

  const isBorrow = protocolAction === ProtocolAction.borrow;
  const displayAPY = isBorrow
    ? protocolAPY - protocolIncentivesAPR - meritIncentivesAPR - merklIncentivesAPR
    : protocolAPY + protocolIncentivesAPR + meritIncentivesAPR + merklIncentivesAPR;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align || { xs: 'flex-end', xsm: 'center' },
        justifyContent: 'center',
        textAlign: 'center',
        gap: 1,
      }}
    >
      {value.toString() !== '-1' ? (
        <Box sx={{ display: 'flex' }}>
          <FormattedNumber
            data-cy={`apy`}
            value={displayAPY}
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
        sx={{
          display: 'flex',
          gap: '4px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
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
          protocolIncentives={incentives || []}
        />
        <MerklIncentivesButton
          market={market}
          rewardedAsset={address}
          protocolAction={protocolAction}
          protocolAPY={protocolAPY}
          protocolIncentives={incentives || []}
        />
        <EthenaIncentivesButton rewardedAsset={address} />
        <EtherfiIncentivesButton symbol={symbol} market={market} protocolAction={protocolAction} />
        <SonicIncentivesButton rewardedAsset={address} />
      </Box>
    </Box>
  );
};
