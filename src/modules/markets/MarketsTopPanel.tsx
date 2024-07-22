import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { marketContainerProps } from 'pages/markets.page';
import * as React from 'react';
import { MULTIPLE_MARKET_OPTIONS } from 'src/components/MarketSwitcher';
import { StyledTxModalToggleButton } from 'src/components/StyledToggleButton';
import { StyledTxModalToggleGroup } from 'src/components/StyledToggleButtonGroup';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { CustomMarket } from 'src/utils/marketsAndNetworksConfig';

import { FormattedNumber } from '../../components/primitives/FormattedNumber';
import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';
import { TopInfoPanelItem } from '../../components/TopInfoPanel/TopInfoPanelItem';
import { useAppDataContext } from '../../hooks/app-data-provider/useAppDataProvider';

export const MarketsTopPanel = () => {
  const { reserves, loading } = useAppDataContext();
  const { currentMarket, setCurrentMarket } = useProtocolDataContext();
  const handleUpdateEthMarket = (market: CustomMarket) => {
    setCurrentMarket(market);
  };

  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  const aggregatedStats = reserves.reduce(
    (acc, reserve) => {
      return {
        totalLiquidity: acc.totalLiquidity.plus(reserve.totalLiquidityUSD),
        totalDebt: acc.totalDebt.plus(reserve.totalDebtUSD),
      };
    },
    {
      totalLiquidity: valueToBigNumber(0),
      totalDebt: valueToBigNumber(0),
    }
  );

  const valueTypographyVariant = downToSM ? 'main16' : 'main21';
  const symbolsVariant = downToSM ? 'secondary16' : 'secondary21';

  return (
    <Box>
      <TopInfoPanel
        containerProps={marketContainerProps}
        pageTitle={<Trans>Markets</Trans>}
        withMarketSwitcher
        multiMarket={MULTIPLE_MARKET_OPTIONS.includes(currentMarket) ? true : false}
      >
        <Box sx={{ display: 'flex' }}>
          <TopInfoPanelItem hideIcon title={<Trans>Total market size</Trans>} loading={loading}>
            <FormattedNumber
              value={aggregatedStats.totalLiquidity.toString()}
              symbol="USD"
              variant={valueTypographyVariant}
              visibleDecimals={2}
              compact
              symbolsColor="#A5A8B6"
              symbolsVariant={symbolsVariant}
            />
          </TopInfoPanelItem>
          <TopInfoPanelItem hideIcon title={<Trans>Total available</Trans>} loading={loading}>
            <FormattedNumber
              value={aggregatedStats.totalLiquidity.minus(aggregatedStats.totalDebt).toString()}
              symbol="USD"
              variant={valueTypographyVariant}
              visibleDecimals={2}
              compact
              symbolsColor="#A5A8B6"
              symbolsVariant={symbolsVariant}
            />
          </TopInfoPanelItem>
          <TopInfoPanelItem hideIcon title={<Trans>Total borrows</Trans>} loading={loading}>
            <FormattedNumber
              value={aggregatedStats.totalDebt.toString()}
              symbol="USD"
              variant={valueTypographyVariant}
              visibleDecimals={2}
              compact
              symbolsColor="#A5A8B6"
              symbolsVariant={symbolsVariant}
            />
          </TopInfoPanelItem>
        </Box>

        {MULTIPLE_MARKET_OPTIONS.includes(currentMarket) && (
          <Box pb={0} sx={{ width: 'calc(50% - 8px)' }}>
            <StyledTxModalToggleGroup
              color="secondary"
              value={currentMarket}
              exclusive
              onChange={(_, value) => handleUpdateEthMarket(value)}
            >
              <StyledTxModalToggleButton
                maxWidth="160px"
                unselectedBackgroundColor="#383D51"
                value={'proto_mainnet_v3'}
                disabled={currentMarket === 'proto_mainnet_v3'}
                // Todo tracking?
                // onClick={() =>
                //   trackEvent(WITHDRAW_MODAL.SWITCH_WITHDRAW_TYPE, { withdrawType: 'Withdraw' })
                // }
              >
                <Typography variant="buttonM">
                  <Trans>Ethereum Main</Trans>
                </Typography>
              </StyledTxModalToggleButton>

              <StyledTxModalToggleButton
                maxWidth="160px"
                unselectedBackgroundColor="#383D51"
                value={'proto_lido_v3'}
                disabled={currentMarket === 'proto_lido_v3'}
                // Todo tracking?
              >
                <Typography variant="buttonM">
                  <Trans>Lido</Trans>
                </Typography>
              </StyledTxModalToggleButton>
            </StyledTxModalToggleGroup>
          </Box>
        )}
      </TopInfoPanel>
    </Box>
  );
};
