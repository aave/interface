import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { useMediaQuery, useTheme, Box, Typography } from '@mui/material';
import { marketContainerProps } from 'pages/markets.page';
import * as React from 'react';
import { StyledTxModalToggleButton } from 'src/components/StyledToggleButton';
import { StyledTxModalToggleGroup } from 'src/components/StyledToggleButtonGroup';
import { FormattedNumber } from '../../components/primitives/FormattedNumber';
import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';
import { TopInfoPanelItem } from '../../components/TopInfoPanel/TopInfoPanelItem';
import { useAppDataContext } from '../../hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

export const MarketsTopPanel = () => {
  const { reserves, loading } = useAppDataContext();
  const { currentMarket, setCurrentMarket } = useProtocolDataContext();
  const handleUpdateEthMarket = (market: string) => {
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
    <Box sx={{ background: 'green' }}>
      <TopInfoPanel
        containerProps={marketContainerProps}
        pageTitle={<Trans>Markets</Trans>}
        withMarketSwitcher
      >
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
      </TopInfoPanel>
      {/* <Box pb={2} sx={{ width: upFromSm ? 'calc(50% - 8px)' : '100%' }}> */}
    </Box>
  );
};
