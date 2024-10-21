import { valueToBigNumber } from '@aave/math-utils';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { AaveV3Ethereum } from '@bgd-labs/aave-address-book';
import { DotsHorizontalIcon } from '@heroicons/react/solid';
import { Box, SvgIcon, Typography } from '@mui/material';
import { useState } from 'react';
import {
  MeritAction,
  useMeritIncentives,
  useUserMeritIncentives,
} from 'src/hooks/useMeritIncentives';
import { useRootStore } from 'src/store/root';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { DASHBOARD } from 'src/utils/mixPanelEvents';
import { Side } from 'src/utils/utils';

import { ContentWithTooltip } from '../ContentWithTooltip';
import { FormattedNumber } from '../primitives/FormattedNumber';
import { TokenIcon } from '../primitives/TokenIcon';
import { getSymbolMap, IncentivesTooltipContent } from './IncentivesTooltipContent';
import { MeritIncentivesTooltipContent } from './MeritIncentivesTooltipContent';

interface IncentivesButtonProps {
  symbol: string;
  incentives?: ReserveIncentiveResponse[];
  displayBlank?: boolean;
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

export const UserMeritIncentivesButton = ({
  meritReserveIncentiveData,
}: {
  meritReserveIncentiveData: MeritReserveIncentiveData;
}) => {
  const [open, setOpen] = useState(false);
  const { data: meritIncentives } = useUserMeritIncentives();

  if (!meritIncentives) {
    return null;
  }

  const incentives = {
    incentiveAPR: (meritIncentives.actionsAPR[meritReserveIncentiveData.action] / 100).toString(),
    rewardTokenSymbol: 'GHO', // rewards alwasy in gho, for now
    rewardTokenAddress: '0x', // not used for merit program
  };

  return (
    <ContentWithTooltip
      tooltipContent={
        <MeritIncentivesTooltipContent
          incentiveAPR={incentives.incentiveAPR}
          rewardTokenSymbol={incentives.rewardTokenSymbol}
        />
      }
      withoutHover
      setOpen={setOpen}
      open={open}
    >
      <Content incentives={[incentives]} incentivesNetAPR={+incentives.incentiveAPR} />
    </ContentWithTooltip>
  );
};

export const DefaultMeritIncentivesButton = ({
  meritReserveIncentiveData,
}: {
  meritReserveIncentiveData: MeritReserveIncentiveData;
}) => {
  const [open, setOpen] = useState(false);
  const { data: meritIncentives } = useMeritIncentives(meritReserveIncentiveData);

  if (!meritIncentives) {
    return null;
  }

  return (
    <ContentWithTooltip
      tooltipContent={
        <MeritIncentivesTooltipContent
          incentiveAPR={meritIncentives.incentiveAPR}
          rewardTokenSymbol={meritIncentives.rewardTokenSymbol}
        />
      }
      withoutHover
      setOpen={setOpen}
      open={open}
    >
      <Content incentives={[meritIncentives]} incentivesNetAPR={+meritIncentives.incentiveAPR} />
    </ContentWithTooltip>
  );
};

export type MeritReserveIncentiveData = Omit<ReserveIncentiveResponse, 'incentiveAPR'> & {
  action: MeritAction;
  side?: Side;
};

const symbolToMeritData = (
  symbol: string,
  market: string
): MeritReserveIncentiveData | undefined => {
  switch (market) {
    case CustomMarket.proto_mainnet_v3:
      // return symbolToActionMapEthereum.get(symbol);
      switch (symbol) {
        case 'GHO':
          return {
            action: MeritAction.ETHEREUM_STKGHO,
            rewardTokenAddress: AaveV3Ethereum.ASSETS.GHO.UNDERLYING,
            rewardTokenSymbol: 'GHO',
          };
        case 'cbBTC':
          return {
            action: MeritAction.SUPPLY_CBBTC_BORROW_USDC,
            rewardTokenAddress: AaveV3Ethereum.ASSETS.USDC.A_TOKEN,
            rewardTokenSymbol: 'aEthUSDC',
            side: Side.SUPPLY,
          };
        case 'USDC':
          return {
            action: MeritAction.SUPPLY_CBBTC_BORROW_USDC,
            rewardTokenAddress: AaveV3Ethereum.ASSETS.USDC.A_TOKEN,
            rewardTokenSymbol: 'aEthUSDC',
            side: Side.BORROW,
          };
        default:
          return undefined;
      }
    default:
      return undefined;
  }
};

export const MeritIncentivesButton = ({
  symbol,
  market,
  side,
}: {
  symbol: string;
  market: string;
  side?: Side;
}) => {
  const meritReserveIncentiveData = symbolToMeritData(symbol, market);
  if (!meritReserveIncentiveData) {
    return null;
  }
  if (meritReserveIncentiveData.side !== side) {
    return null;
  }
  return <DefaultMeritIncentivesButton meritReserveIncentiveData={meritReserveIncentiveData} />;
  // if (hasBalance) {
  //   return <UserMeritIncentivesButton meritReserveIncentiveData={meritReserveIncentiveData} />;
  // } else {
  //   return <DefaultMeritIncentivesButton meritReserveIncentiveData={meritReserveIncentiveData} />;
  // }
};

export const IncentivesButton = ({ incentives, symbol, displayBlank }: IncentivesButtonProps) => {
  const [open, setOpen] = useState(false);

  if (!(incentives && incentives.length > 0)) {
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

const Content = ({
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
              {incentives.map(getSymbolMap).map((incentive) => {
                return (
                  <TokenIcon
                    aToken={incentive.aToken}
                    symbol={incentive.tokenIconSymbol}
                    sx={{ fontSize: `${iconSize}px`, ml: -1 }}
                    key={incentive.tokenIconSymbol}
                  />
                );
              })}
            </>
          ) : (
            <>
              {incentives
                .slice(0, 3)
                .map(getSymbolMap)
                .map((incentive) => (
                  <TokenIcon
                    symbol={incentive.tokenIconSymbol}
                    sx={{ fontSize: `${iconSize}px`, ml: -1 }}
                    key={incentive.tokenIconSymbol}
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
