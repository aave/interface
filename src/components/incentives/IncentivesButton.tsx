import { ProtocolAction } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import { useEthenaIncentives } from 'src/hooks/useEthenaIncentives';
import { useEtherfiIncentives } from 'src/hooks/useEtherfiIncentives';
import { useMeritIncentives } from 'src/hooks/useMeritIncentives';
import { ExtendedReserveIncentiveResponse, useMerklIncentives } from 'src/hooks/useMerklIncentives';
import { useMerklPointsIncentives } from 'src/hooks/useMerklPointsIncentives';
import { useSonicIncentives } from 'src/hooks/useSonicIncentives';
import { useRootStore } from 'src/store/root';
import { DASHBOARD } from 'src/utils/events';

import { ContentWithTooltip } from '../ContentWithTooltip';
import { FormattedNumber } from '../primitives/FormattedNumber';
import { EthenaAirdropTooltipContent } from './EthenaIncentivesTooltipContent';
import { EtherFiAirdropTooltipContent } from './EtherfiIncentivesTooltipContent';
import { IncentivesTooltipContent } from './IncentivesTooltipContent';
import { MeritIncentivesTooltipContent } from './MeritIncentivesTooltipContent';
import { MerklIncentivesTooltipContent } from './MerklIncentivesTooltipContent';
import { SonicAirdropTooltipContent } from './SonicIncentivesTooltipContent';

const INFINITY = 'Infinity';

export type IconProps = {
  className?: string;
  width?: string | number;
  height?: string | number;
  viewBox?: string;
  style?: React.CSSProperties;
  color?: string;
};

export type IconWrapperProps = {
  children?: React.ReactNode;
} & IconProps;

export const Icon = ({
  className = '',
  width = '24px',
  height = '24px',
  viewBox = '0 0 20 20',
  children,
  color,
  ...props
}: IconWrapperProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      data-color={color}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className={className}
      style={{
        display: 'flex',
        flexShrink: 0,
        ...props.style,
      }}
      {...props}
    >
      {children}
    </svg>
  );
};

interface IncentivesButtonProps {
  symbol: string;
  incentives?: ReserveIncentiveResponse[];
  displayBlank?: boolean;
  market?: string;
  protocolAction?: ProtocolAction;
  protocolAPY?: number;
  address?: string;
}

export function IncentivesIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      {...props}
      viewBox="0 0 16 16"
      className={props.className}
      style={{
        display: 'flex',
        flexShrink: 0,
        ...props.style,
      }}
    >
      <circle
        cx="7.2"
        cy="7.2"
        r="7.2"
        stroke="#9391F7"
        strokeWidth="1.5"
        transform="matrix(1 0 0 -1 .8 15.2)"
      />
      <path
        stroke="#BCBBFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="m4.557 8.082.891 1.132a1 1 0 0 0 1.591-.026l1.75-2.376a1 1 0 0 1 1.591-.026l1.064 1.35"
      />
    </svg>
  );
}

const BlankIncentives = () => {
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

export const MeritIncentivesButton = (params: {
  symbol: string;
  market: string;
  protocolAction?: ProtocolAction;
  protocolAPY?: number;
  protocolIncentives?: ReserveIncentiveResponse[];
  hideValue?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const { data: meritIncentives } = useMeritIncentives(params);

  if (!meritIncentives) {
    return null;
  }

  // Show only merit incentives APR
  const displayValue = +meritIncentives.incentiveAPR;

  return (
    <ContentWithTooltip
      tooltipContent={
        <MeritIncentivesTooltipContent
          meritIncentives={meritIncentives}
          onClose={() => setOpen(false)}
        />
      }
      withoutHover
      setOpen={setOpen}
      open={open}
    >
      <Content
        incentives={[meritIncentives]}
        incentivesNetAPR={displayValue}
        hideValue={params.hideValue}
      />
    </ContentWithTooltip>
  );
};

export const MerklIncentivesButton = (params: {
  market: string;
  rewardedAsset?: string;
  protocolAction?: ProtocolAction;
  protocolAPY?: number;
  protocolIncentives?: ReserveIncentiveResponse[];
}) => {
  const [open, setOpen] = useState(false);
  const { data: merklIncentives } = useMerklIncentives(params);
  const { data: merklPointsIncentives } = useMerklPointsIncentives(params);

  let incentiveData = null;
  let incentiveAPR = 0;

  if (merklIncentives?.breakdown) {
    if (merklIncentives.breakdown.points) {
      incentiveData = merklPointsIncentives;
      incentiveAPR = merklPointsIncentives?.incentiveAPR ? +merklPointsIncentives.incentiveAPR : 0;
    } else {
      incentiveData = merklIncentives;
      incentiveAPR = +merklIncentives.incentiveAPR;
    }
  } else if (merklPointsIncentives?.breakdown) {
    incentiveData = merklPointsIncentives;
    incentiveAPR = +merklPointsIncentives.incentiveAPR;
  }

  if (!incentiveData) {
    return null;
  }

  return (
    <ContentWithTooltip
      tooltipContent={<MerklIncentivesTooltipContent merklIncentives={incentiveData} />}
      withoutHover
      setOpen={setOpen}
      open={open}
    >
      <Content incentives={[incentiveData]} incentivesNetAPR={incentiveAPR} />
    </ContentWithTooltip>
  );
};

export const EthenaIncentivesButton = ({ rewardedAsset }: { rewardedAsset?: string }) => {
  const [open, setOpen] = useState(false);
  const points = useEthenaIncentives(rewardedAsset);

  if (!points) {
    return null;
  }

  return (
    <ContentWithTooltip
      tooltipContent={<EthenaAirdropTooltipContent points={points} />}
      withoutHover
      setOpen={setOpen}
      open={open}
    >
      <ContentEthenaButton points={points} />
    </ContentWithTooltip>
  );
};

export const EtherfiIncentivesButton = (params: {
  symbol: string;
  market: string;
  protocolAction?: ProtocolAction;
}) => {
  const [open, setOpen] = useState(false);
  const { market, protocolAction, symbol } = params;
  const multiplier = useEtherfiIncentives(market, symbol, protocolAction);

  if (!multiplier) {
    return null;
  }

  return (
    <ContentWithTooltip
      tooltipContent={<EtherFiAirdropTooltipContent multiplier={multiplier} />}
      withoutHover
      setOpen={setOpen}
      open={open}
    >
      <ContentEtherfiButton multiplier={multiplier} />
    </ContentWithTooltip>
  );
};

export const SonicIncentivesButton = ({ rewardedAsset }: { rewardedAsset?: string }) => {
  const [open, setOpen] = useState(false);
  const points = useSonicIncentives(rewardedAsset);

  if (!points) {
    return null;
  }

  return (
    <ContentWithTooltip
      tooltipContent={<SonicAirdropTooltipContent points={points} />}
      withoutHover
      setOpen={setOpen}
      open={open}
    >
      <ContentSonicButton points={points} />
    </ContentWithTooltip>
  );
};

export const IncentivesButton = ({
  incentives,
  symbol,
  displayBlank,
  market,
  protocolAction,
  protocolAPY,
  address,
}: IncentivesButtonProps) => {
  const [open, setOpen] = useState(false);

  if (!(incentives && incentives.length > 0)) {
    if (displayBlank) {
      return <BlankIncentives />;
    } else {
      return null;
    }
  }

  const isIncentivesInfinity = incentives.some((incentive) => incentive.incentiveAPR === INFINITY);
  const incentivesAPRSum = isIncentivesInfinity
    ? INFINITY
    : incentives.reduce((aIncentive, bIncentive) => aIncentive + +bIncentive.incentiveAPR, 0);

  const incentivesNetAPR = isIncentivesInfinity
    ? INFINITY
    : incentivesAPRSum !== INFINITY
    ? valueToBigNumber(incentivesAPRSum || 0).toNumber()
    : INFINITY;

  return (
    <ContentWithTooltip
      tooltipContent={
        <IncentivesTooltipContent
          incentives={incentives}
          incentivesNetAPR={incentivesNetAPR}
          symbol={symbol}
          market={market}
          protocolAction={protocolAction}
          protocolAPY={protocolAPY}
          address={address}
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

const Content = ({
  incentives,
  incentivesNetAPR,
  displayBlank,
  plus,
  hideValue,
}: {
  incentives: ReserveIncentiveResponse[];
  incentivesNetAPR: number | typeof INFINITY;
  displayBlank?: boolean;
  plus?: boolean;
  hideValue?: boolean;
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
  const hasPointsBreakdown = incentives.some(
    (incentive) => (incentive as ExtendedReserveIncentiveResponse)?.breakdown?.points !== undefined
  );

  if (incentivesNetAPR === 0 && !hasPointsBreakdown) {
    return displayBlank ? <BlankIncentives /> : null;
  }

  const incentivesButtonValue = () => {
    // NOTE: For GHO incentives, we want to show the formatted number given its on sGHO page only

    const hasGhoIncentives = incentives.some(
      (incentive) =>
        incentive.rewardTokenSymbol?.toLowerCase().includes('gho') ||
        incentive.rewardTokenSymbol?.toLowerCase().includes('agho') ||
        incentive.rewardTokenSymbol?.toLowerCase().includes('abasgho')
    );
    if (hideValue && hasGhoIncentives) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IncentivesIcon width="16" height="16" />
        </Box>
      );
    }
    if (hasGhoIncentives) {
      if (incentivesNetAPR !== INFINITY && incentivesNetAPR < 10000) {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FormattedNumber
              value={incentivesNetAPR}
              percent
              variant="secondary12"
              color="text.secondary"
            />
            <IncentivesIcon width="16" height="16" />
          </Box>
        );
      } else if (incentivesNetAPR !== INFINITY && incentivesNetAPR > 9999) {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FormattedNumber
              value={incentivesNetAPR}
              percent
              compact
              variant="secondary12"
              color="text.secondary"
            />
            <IncentivesIcon width="16" height="16" />
          </Box>
        );
      } else if (incentivesNetAPR === INFINITY) {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="main12" color="text.secondary">
              ∞
            </Typography>
            <IncentivesIcon width="16" height="16" />
          </Box>
        );
      }
    }

    // Default behavior: show icon for non-GHO incentives
    return (
      <>
        <IncentivesIcon width="16" height="16" />
      </>
    );
  };

  // const iconSize = 12;

  return (
    <Box
      sx={() => ({
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.2s ease',
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
      <Box sx={{ p: 0.5 }}>
        {plus ? '+' : ''} {incentivesButtonValue()}
      </Box>
      {/* <Box sx={{ display: 'inline-flex' }}>
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
      </Box> */}
    </Box>
  );
};

const ContentButton = ({ value, iconSrc }: { value: number; iconSrc: string }) => {
  const [open, setOpen] = useState(false);
  const trackEvent = useRootStore((store) => store.trackEvent);

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
        trackEvent(DASHBOARD.VIEW_LM_DETAILS_DASHBOARD, {});
        setOpen(!open);
      }}
    >
      <Box sx={{ mr: 2 }}>
        <Typography component="span" variant="secondary12" color="text.secondary">
          {`${value}x`}
        </Typography>
      </Box>
      <Box sx={{ display: 'inline-flex' }}>
        <img src={iconSrc} width={12} height={12} alt="icon" />
      </Box>
    </Box>
  );
};

const ContentEthenaButton = ({ points }: { points: number }) => (
  <ContentButton value={points} iconSrc="/icons/other/ethena.svg" />
);

const ContentEtherfiButton = ({ multiplier }: { multiplier: number }) => (
  <ContentButton value={multiplier} iconSrc="/icons/other/ether.fi.svg" />
);

const ContentSonicButton = ({ points }: { points: number }) => (
  <ContentButton value={points} iconSrc="/icons/networks/sonic.svg" />
);
