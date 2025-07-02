import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { InformationCircleIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Stack, SvgIcon } from '@mui/material';
import { ReactNode } from 'react';
import { ContentWithTooltip } from 'src/components/ContentWithTooltip';
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
        <ContentWithTooltip tooltipContent={FixedAPYTooltipText} offset={[0, -4]} withoutHover>
          <SvgIcon sx={{ marginLeft: '2px', fontSize: '16px' }}>
            <InformationCircleIcon />
          </SvgIcon>
        </ContentWithTooltip>
      </Stack>
      {children}
    </ListColumn>
  );
};

const FixedAPYTooltipText = (
  <Trans>
    Estimated compounding interest rate, that is determined by Aave Governance. This rate may be
    changed over time depending on the need for the GHO supply to contract/expand.{' '}
    {/* <Link
      href="https://docs.gho.xyz/concepts/how-gho-works/interest-rate-discount-model#interest-rate-model"
      underline="always"
    >
      <Trans>Learn more</Trans>
    </Link> */}
  </Trans>
);
