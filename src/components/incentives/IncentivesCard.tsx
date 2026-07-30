import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
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
  variant?: 'subheader1' | 'h4' | 'h5';
  symbolsVariant?: 'h5' | 'secondary16';
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
  variant = 'h5',
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

  const meritIncentivesAPR = meritIncentives?.breakdown?.meritIncentivesAPR || 0;

  // TODO: This is a one-off for the Self campaign.
  // Remove once the Self incentives are finished.
  const selfAPY = ENABLE_SELF_CAMPAIGN ? meritIncentives?.variants?.selfAPY ?? 0 : 0;
  const totalMeritAPY = meritIncentivesAPR + selfAPY;

  const merklIncentivesAPR = merklPointsIncentives?.breakdown?.points
    ? merklPointsIncentives.breakdown.merklIncentivesAPR || 0
    : merklIncentives?.breakdown?.merklIncentivesAPR || 0;

  const isBorrow = protocolAction === ProtocolAction.borrow;

  // If any incentive is infinite, the total should be infinite
  const hasInfiniteIncentives = protocolIncentivesAPR === 'Infinity';

  const displayAPY = hasInfiniteIncentives
    ? 'Infinity'
    : isBorrow
    ? protocolAPY - (protocolIncentivesAPY as number) - totalMeritAPY - merklIncentivesAPR
    : protocolAPY + (protocolIncentivesAPY as number) + totalMeritAPY + merklIncentivesAPR;

  const isSghoPage =
    typeof router?.asPath === 'string' && router.asPath.toLowerCase().startsWith('/sgho');
  const hideMeritValue = symbol === 'GHO' && !isSghoPage;
  const isMarketsOrDashboardPage =
    typeof router?.pathname === 'string' &&
    (router.pathname.startsWith('/dashboard') || router.pathname.startsWith('/markets'));
  // Hide GHO Merkl value on dashboard/markets; show only the badge icon.
  const hideMerklValue =
    symbol === 'GHO' &&
    (protocolAction === ProtocolAction.borrow || protocolAction === ProtocolAction.supply) &&
    isMarketsOrDashboardPage;

  // APR-bearing incentives — their yield is already inside the APY %; each renders the purple
  // incentives icon and sits on the same row as (to the left of) the rate it contributes to.
  const apyIncentives = (
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
        hideValue={hideMerklValue}
      />
    </>
  );

  // Points / airdrop programs — not part of the APY %; shown as [brand icon] [multiplier] on a
  // second row beneath the rate.
  const pointsIncentives = (
    <>
      <EthenaIncentivesButton rewardedAsset={address} />
      <EtherfiIncentivesButton symbol={symbol} market={market} protocolAction={protocolAction} />
      <SonicIncentivesButton rewardedAsset={address} />
    </>
  );

  const apyValue =
    value.toString() === '-1' ? (
      <NoData variant={variant} color={color || 'fg-2'} />
    ) : displayAPY === 'Infinity' ? (
      <Typography variant={variant} color={color || 'fg-2'}>
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
    );

  if (inlineIncentives) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          textAlign: 'left',
          flexWrap: 'wrap',
          gap: '0.38rem',
        }}
      >
        {apyIncentives}
        {apyValue}
        {tooltip}
        {pointsIncentives}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align || { xs: 'flex-end', xsm: 'center' },
        justifyContent: 'center',
        textAlign: 'center',
        gap: '0.38rem',
      }}
    >
      {/* Inner column left-aligns the two rows to EACH OTHER (not to the cell), so the top-row
          incentives icon and the bottom-row points icon sit parallel on the same left edge. */}
      <Box
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.38rem' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.38rem' }}>
          {apyIncentives}
          {apyValue}
          {tooltip}
        </Box>
        {/* Points programs on their own row; collapses (via :empty) when every points button
            self-nulls, so the column gap leaves no phantom space beneath the rate. */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.38rem',
            alignItems: 'center',
            justifyContent: 'flex-start',
            '&:empty': { display: 'none' },
          }}
        >
          {pointsIncentives}
        </Box>
      </Box>
    </Box>
  );
};
