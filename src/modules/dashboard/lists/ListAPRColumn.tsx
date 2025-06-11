import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Box } from '@mui/material';
import { ReactNode } from 'react';
import { CustomMarket } from 'src/ui-config/marketsConfig';

import { RateAndIncentivesBox } from '../../../components/incentives/RateAndIncentivesBox';
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
        <RateAndIncentivesBox
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
