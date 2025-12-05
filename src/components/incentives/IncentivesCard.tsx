import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { ReactNode, useMemo } from 'react';
import { ENABLE_SELF_CAMPAIGN, useMeritIncentives } from 'src/hooks/useMeritIncentives';
import { useMerklIncentives } from 'src/hooks/useMerklIncentives';
import { useMerklPointsIncentives } from 'src/hooks/useMerklPointsIncentives';
import { convertAprToApy } from 'src/utils/utils';

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
  displayAPY?: number | 'Infinity';
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
  displayAPY,
}: IncentivesCardProps) => {
  const router = useRouter();
  const protocolAPY = typeof value === 'string' ? parseFloat(value) : value;
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

  const { data: merklPointsIncentives } = useMerklPointsIncentives({
    market,
    rewardedAsset: address,
    protocolAction,
    protocolAPY,
    protocolIncentives: incentives || [],
  });

  const computedDisplayAPY = useMemo(() => {
    if (displayAPY !== undefined) {
      return displayAPY;
    }

    const protocolIncentivesAPR =
      incentives?.reduce((sum, inc) => {
        if (inc.incentiveAPR === 'Infinity' || sum === 'Infinity') {
          return 'Infinity';
        }
        return sum + +inc.incentiveAPR;
      }, 0 as number | 'Infinity') || 0;

    const protocolIncentivesAPY = convertAprToApy(
      protocolIncentivesAPR === 'Infinity' ? 0 : protocolIncentivesAPR
    );

    const meritIncentivesAPR = meritIncentives?.breakdown?.meritIncentivesAPR || 0;
    const selfAPY = ENABLE_SELF_CAMPAIGN ? meritIncentives?.variants?.selfAPY ?? 0 : 0;
    const totalMeritAPY = meritIncentivesAPR + selfAPY;

    const merklIncentivesAPR = merklPointsIncentives?.breakdown?.points
      ? merklPointsIncentives.breakdown.merklIncentivesAPR || 0
      : merklIncentives?.breakdown?.merklIncentivesAPR || 0;

    const isBorrow = protocolAction === ProtocolAction.borrow;
    const hasInfiniteIncentives = protocolIncentivesAPR === 'Infinity';

    return hasInfiniteIncentives
      ? 'Infinity'
      : isBorrow
      ? protocolAPY - (protocolIncentivesAPY as number) - totalMeritAPY - merklIncentivesAPR
      : protocolAPY + (protocolIncentivesAPY as number) + totalMeritAPY + merklIncentivesAPR;
  }, [
    displayAPY,
    incentives,
    meritIncentives,
    merklIncentives,
    merklPointsIncentives,
    protocolAPY,
    protocolAction,
  ]);

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
          {computedDisplayAPY === 'Infinity' ? (
            <Typography variant={variant} color={color || 'text.secondary'}>
              ∞ %
            </Typography>
          ) : (
            <FormattedNumber
              data-cy={`apy`}
              value={computedDisplayAPY}
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
