import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Box, useMediaQuery } from '@mui/material';
import { ReactNode } from 'react';

import { FormattedNumber } from '../primitives/FormattedNumber';
import { NoData } from '../primitives/NoData';
import {
  EthenaIncentivesButton,
  EtherfiIncentivesButton,
  IgnitionIncentivesButton,
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
  align?: 'center' | 'flex-end';
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
  const isTableChangedToCards = useMediaQuery('(max-width:1125px)');
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
            ? {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px',
              }
            : {
                display: 'flex',
                justifyContent: 'center',
                gap: '4px',
                flexWrap: 'wrap',
                flex: '0 0 50%', // 2 items per row
              }
        }
      >
        <IncentivesButton incentives={incentives} symbol={symbol} />
        <MeritIncentivesButton symbol={symbol} market={market} protocolAction={protocolAction} />
        <MerklIncentivesButton
          market={market}
          rewardedAsset={address}
          protocolAction={protocolAction}
        />
        <EthenaIncentivesButton rewardedAsset={address} />
        <EtherfiIncentivesButton symbol={symbol} market={market} protocolAction={protocolAction} />
        <SonicIncentivesButton rewardedAsset={address} />
        <IgnitionIncentivesButton symbol={symbol} market={market} protocolAction={protocolAction} />
      </Box>
    </Box>
  );
};
