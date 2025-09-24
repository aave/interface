import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { useBoostedAPY } from 'src/hooks/useBoostedAPY';

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
  align?: 'center' | 'flex-end';
  inlineIncentives?: boolean;
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
  inlineIncentives = false,
}: IncentivesCardProps) => {
  const router = useRouter();
  const protocolAPY = typeof value === 'string' ? parseFloat(value) : value;

  const boostedAPY = useBoostedAPY({
    symbol,
    market,
    protocolAction,
    protocolAPY,
    incentives,
    address,
  });

  const { displayAPY } = boostedAPY;

  const isSghoPage =
    typeof router?.asPath === 'string' && router.asPath.toLowerCase().startsWith('/sgho');
  const hideMeritValue = symbol === 'GHO' && !isSghoPage;

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
        protocolIncentives={incentives || []}
        hideValue={hideMeritValue}
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
    </>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: inlineIncentives ? 'row' : 'column',
        alignItems: inlineIncentives ? 'center' : align || { xs: 'flex-end', xsm: 'center' },
        justifyContent: inlineIncentives ? 'flex-start' : 'center',
        textAlign: inlineIncentives ? 'left' : 'center',
        gap: inlineIncentives ? 1 : 1,
      }}
    >
      {value.toString() !== '-1' ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {displayAPY === 'Infinity' ? (
            <Typography variant={variant} color={color || 'text.secondary'}>
              ∞ %
            </Typography>
          ) : (
            <FormattedNumber
              data-cy={`apy`}
              value={displayAPY}
              percent
              variant={variant}
              symbolsVariant={symbolsVariant}
              color={color}
              symbolsColor={color}
            />
          )}
          {tooltip}
          {inlineIncentives && (
            <Box
              sx={{
                display: 'flex',
                gap: '4px',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              {incentivesContent}
            </Box>
          )}
        </Box>
      ) : (
        <NoData variant={variant} color={color || 'text.secondary'} />
      )}
      {!inlineIncentives && (
        <Box
          sx={{
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {incentivesContent}
        </Box>
      )}
    </Box>
  );
};
