import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Box, Stack } from '@mui/material';
import { ReactNode } from 'react';
import { GhoRateTooltip } from 'src/components/infoTooltips/GhoRateTooltip';
import { CustomMarket } from 'src/ui-config/marketsConfig';

import { IncentivesCard } from '../../../components/incentives/IncentivesCard';
import { ListColumn } from '../../../components/lists/ListColumn';

interface ListAPRColumnProps {
  value: number;
  market: CustomMarket;
  protocolAction: ProtocolAction;
  address: string;
  incentives?: ReserveIncentiveResponse[];
  symbol: string;
  tooltip?: ReactNode;
  children?: ReactNode;
}

export const ListAPRColumn = ({
  value,
  market,
  protocolAction,
  address,
  incentives,
  symbol,
  tooltip,
  children,
}: ListAPRColumnProps) => {
  return (
    <ListColumn>
      <Box sx={{ display: 'flex column' }}>
        <IncentivesCard
          value={value}
          incentives={incentives}
          address={address}
          symbol={symbol}
          market={market}
          protocolAction={protocolAction}
        />
        {tooltip}
      </Box>
      {children}
    </ListColumn>
  );
};

export const ListGhoAPRColumn = ({
  value,
  market,
  protocolAction,
  address,
  incentives,
  symbol,
  children,
}: ListAPRColumnProps) => {
  return (
    <ListColumn>
      <Stack direction="row" alignItems="center" gap={1}>
        <IncentivesCard
          value={value}
          incentives={incentives}
          address={address}
          symbol={symbol}
          market={market}
          protocolAction={protocolAction}
        />
        <GhoRateTooltip />
      </Stack>
      {children}
    </ListColumn>
  );
};
