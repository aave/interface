import { ProtocolAction } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { DotsHorizontalIcon } from '@heroicons/react/solid';
import { Box, SvgIcon, Typography } from '@mui/material';
import { useState } from 'react';
import { useMeritIncentives } from 'src/hooks/useMeritIncentives';
import { useZkSyncIgniteIncentives } from 'src/hooks/useZkSyncIgniteIncentives';
import { useRootStore } from 'src/store/root';
import { DASHBOARD } from 'src/utils/mixPanelEvents';
import { getNoAprExternalIncentivesTooltipConfig } from 'src/utils/utils';

import { ContentWithTooltip } from '../ContentWithTooltip';
import { SpkAirdropTooltip } from '../infoTooltips/SpkAirdropTooltip';
import { SuperFestTooltip } from '../infoTooltips/SuperFestTooltip';
import { FormattedNumber } from '../primitives/FormattedNumber';
import { TokenIcon } from '../primitives/TokenIcon';
import { getSymbolMap, IncentivesTooltipContent } from './IncentivesTooltipContent';
import { MeritIncentivesTooltipContent } from './MeritIncentivesTooltipContent';
import { ZkSyncIgniteIncentivesTooltipContent } from './ZkSyncIgniteIncentivesTooltipContent';

interface IncentivesButtonProps {
  symbol: string;
  incentives?: ReserveIncentiveResponse[];
  displayBlank?: boolean;
}

interface NoAprExternalIncentiveTooltipProps {
  market: string;
  symbol?: string;
  protocolAction?: ProtocolAction;
}

export const BlankIncentives = () => {
  return (
    <Box
      sx={{
        p: { xs: '0 4px', xsm: '3.625px 4px' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="main12" color="text.secondary">
        &nbsp;
      </Typography>
    </Box>
  );
};

export const useAllIncentives = ({
  symbol,
  rewardedAsset,
  market,
  protocolAction,
  lmIncentives,
}: {
  symbol: string;
  market: string;
  rewardedAsset?: string;
  protocolAction?: ProtocolAction;
  lmIncentives?: ReserveIncentiveResponse[];
}) => {
  const { data: meritIncentives } = useMeritIncentives({
    symbol,
    market,
    protocolAction,
  });
  const { data: zkSyncIgniteIncentives } = useZkSyncIgniteIncentives({
    market,
    rewardedAsset,
    protocolAction,
  });
  const lmIncentivesFiltered = lmIncentives?.filter((i) => i.incentiveAPR !== '0');

  const meritApr =
    meritIncentives && meritIncentives.incentiveAPR ? Number(meritIncentives?.incentiveAPR) : 0;
  const zkSyncApr =
    zkSyncIgniteIncentives && zkSyncIgniteIncentives.incentiveAPR
      ? Number(zkSyncIgniteIncentives?.incentiveAPR)
      : 0;
  const lmApr = lmIncentivesFiltered?.reduce((a, b) => a + +b.incentiveAPR, 0) ?? 0;

  const totalApr = meritApr + zkSyncApr + lmApr;

  const allIncentives = [
    ...(meritIncentives ? [meritIncentives] : []),
    ...(zkSyncIgniteIncentives ? [zkSyncIgniteIncentives] : []),
    ...(lmIncentivesFiltered || []),
  ];

  return { allIncentives, totalApr };
};

export const MeritIncentivesButton = (params: {
  symbol: string;
  market: string;
  protocolAction?: ProtocolAction;
}) => {
  const [open, setOpen] = useState(false);
  const { data: meritIncentives } = useMeritIncentives(params);

  if (!meritIncentives) {
    return null;
  }

  return (
    <ContentWithTooltip
      tooltipContent={<MeritIncentivesTooltipContent meritIncentives={meritIncentives} />}
      withoutHover
      setOpen={setOpen}
      open={open}
    >
      <Content incentives={[meritIncentives]} incentivesNetAPR={+meritIncentives.incentiveAPR} />
    </ContentWithTooltip>
  );
};

export const ZkIgniteIncentivesButton = (params: {
  market: string;
  rewardedAsset?: string;
  protocolAction?: ProtocolAction;
}) => {
  const [open, setOpen] = useState(false);
  const { data: zkSyncIgniteIncentives } = useZkSyncIgniteIncentives(params);

  if (!zkSyncIgniteIncentives) {
    return null;
  }

  return (
    <ContentWithTooltip
      tooltipContent={
        <ZkSyncIgniteIncentivesTooltipContent zkSyncIgniteIncentives={zkSyncIgniteIncentives} />
      }
      withoutHover
      setOpen={setOpen}
      open={open}
    >
      <Content
        incentives={[zkSyncIgniteIncentives]}
        incentivesNetAPR={+zkSyncIgniteIncentives.incentiveAPR}
      />
    </ContentWithTooltip>
  );
};

export const NoAprExternalIncentiveTooltip = ({
  market,
  symbol,
  protocolAction,
}: NoAprExternalIncentiveTooltipProps) => {
  if (!symbol || !protocolAction) {
    return null;
  }

  const noAprExternalIncentivesTooltips = getNoAprExternalIncentivesTooltipConfig(
    symbol,
    market,
    protocolAction
  );

  return (
    <>
      {noAprExternalIncentivesTooltips.superFestRewards && <SuperFestTooltip />}
      {noAprExternalIncentivesTooltips.spkAirdrop && <SpkAirdropTooltip />}
    </>
  );
};

export const IncentivesButton = ({ incentives, symbol, displayBlank }: IncentivesButtonProps) => {
  const [open, setOpen] = useState(false);

  if (!(incentives && incentives.filter((i) => i.incentiveAPR !== '0').length > 0)) {
    if (displayBlank) {
      return <BlankIncentives />;
    } else {
      return null;
    }
  }

  const isIncentivesInfinity = incentives.some(
    (incentive) => incentive.incentiveAPR === 'Infinity'
  );
  const incentivesAPRSum = isIncentivesInfinity
    ? 'Infinity'
    : incentives.reduce((aIncentive, bIncentive) => aIncentive + +bIncentive.incentiveAPR, 0);

  const incentivesNetAPR = isIncentivesInfinity
    ? 'Infinity'
    : incentivesAPRSum !== 'Infinity'
    ? valueToBigNumber(incentivesAPRSum || 0).toNumber()
    : 'Infinity';

  return (
    <ContentWithTooltip
      tooltipContent={
        <IncentivesTooltipContent
          incentives={incentives}
          incentivesNetAPR={incentivesNetAPR}
          symbol={symbol}
        />
      }
      withoutHover
      setOpen={setOpen}
      open={open}
    >
      <Content
        incentives={incentives}
        incentivesNetAPR={incentivesNetAPR}
        displayBlank={displayBlank}
      />
    </ContentWithTooltip>
  );
};

export const Content = ({
  incentives,
  incentivesNetAPR,
  displayBlank,
  plus,
}: {
  incentives: ReserveIncentiveResponse[];
  incentivesNetAPR: number | 'Infinity';
  displayBlank?: boolean;
  plus?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const trackEvent = useRootStore((store) => store.trackEvent);

  if (!(incentives && incentives.length > 0)) {
    if (displayBlank) {
      return <BlankIncentives />;
    } else {
      return null;
    }
  }

  if (incentivesNetAPR === 0) {
    if (displayBlank) {
      return <BlankIncentives />;
    } else {
      return null;
    }
  }

  const incentivesButtonValue = () => {
    if (incentivesNetAPR !== 'Infinity' && incentivesNetAPR < 10000) {
      return (
        <FormattedNumber
          value={incentivesNetAPR}
          percent
          variant="secondary12"
          color="text.secondary"
        />
      );
    } else if (incentivesNetAPR !== 'Infinity' && incentivesNetAPR > 9999) {
      return (
        <FormattedNumber
          value={incentivesNetAPR}
          percent
          compact
          variant="secondary12"
          color="text.secondary"
        />
      );
    } else if (incentivesNetAPR === 'Infinity') {
      return (
        <Typography variant="main12" color="text.secondary">
          ∞
        </Typography>
      );
    }
  };

  const iconSize = 12;

  return (
    <Box
      sx={(theme) => ({
        p: { xs: '0 4px', xsm: '2px 4px' },
        border: `1px solid ${open ? theme.palette.action.disabled : theme.palette.divider}`,
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.2s ease',
        bgcolor: open ? 'action.hover' : 'transparent',
        '&:hover': {
          bgcolor: 'action.hover',
          borderColor: 'action.disabled',
        },
      })}
      onClick={() => {
        // TODO: How to handle this for event props?
        trackEvent(DASHBOARD.VIEW_LM_DETAILS_DASHBOARD, {});
        setOpen(!open);
      }}
    >
      <Box sx={{ mr: 2 }}>
        {plus ? '+' : ''} {incentivesButtonValue()}
      </Box>
      <Box sx={{ display: 'inline-flex' }}>
        <>
          {incentives.length < 5 ? (
            <>
              {incentives.map(getSymbolMap).map((incentive, index) => {
                return (
                  <TokenIcon
                    aToken={incentive.aToken}
                    symbol={incentive.tokenIconSymbol}
                    sx={{ fontSize: `${iconSize}px`, ml: -1 }}
                    key={index}
                  />
                );
              })}
            </>
          ) : (
            <>
              {incentives
                .slice(0, 3)
                .map(getSymbolMap)
                .map((incentive, index) => (
                  <TokenIcon
                    symbol={incentive.tokenIconSymbol}
                    sx={{ fontSize: `${iconSize}px`, ml: -1 }}
                    key={index}
                  />
                ))}
              <SvgIcon
                sx={{
                  fontSize: `${iconSize}px`,
                  borderRadius: '50%',
                  bgcolor: 'common.white',
                  color: 'common.black',
                  ml: -1,
                  zIndex: 5,
                }}
              >
                <DotsHorizontalIcon />
              </SvgIcon>
            </>
          )}
        </>
      </Box>
    </Box>
  );
};
