import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Divider, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { ChainAvailabilityText } from 'src/components/ChainAvailabilityText';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { TopInfoPanel } from 'src/components/TopInfoPanel/TopInfoPanel';
import { StakeTokenFormatted, useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { useStakeTokenAPR } from 'src/hooks/useStakeTokenAPR';
import { useRootStore } from 'src/store/root';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { useShallow } from 'zustand/shallow';

import { TokenContractTooltip } from '../../components/infoTooltips/TokenContractTooltip';
import { TopInfoPanelItem } from '../../components/TopInfoPanel/TopInfoPanelItem';

export const SGHOHeader: React.FC = () => {
  const theme = useTheme();
  const [currentMarketData, trackEvent] = useRootStore(
    useShallow((store) => [store.currentMarketData, store.trackEvent])
  );

  const { data: stakeGeneralResult } = useGeneralStakeUiData(currentMarketData);

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'sGHO',
    });
  }, [trackEvent]);

  let stkGho: StakeTokenFormatted | undefined;

  if (stakeGeneralResult && Array.isArray(stakeGeneralResult)) {
    [, , stkGho] = stakeGeneralResult;
  }

  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  const valueTypographyVariant = downToSM ? 'main16' : 'main21';
  const symbolsTypographyVariant = downToSM ? 'secondary16' : 'secondary21';

  if (!stkGho) return null;

  return (
    <TopInfoPanel
      titleComponent={
        <Box mb={4}>
          <ChainAvailabilityText wrapperSx={{ mb: 4 }} chainId={ChainId.mainnet} />

          {downToSM && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 6 }}>
              <Box
                mr={3}
                sx={{ mr: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <TokenIcon symbol="sgho" sx={{ width: 40, height: 40 }} />
              </Box>
              <Box>
                <Typography sx={{ color: '#A5A8B6' }} variant="caption">
                  sGHO
                </Typography>
                <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                  <Typography variant={valueTypographyVariant}>Savings GHO</Typography>
                  <Box sx={{ display: 'flex' }}>
                    <TokenContractTooltip explorerUrl="https://etherscan.io/address/0x1a88Df1cFe15Af22B3c4c783D4e6F7F9e0C1885d" />
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      }
    >
      {!downToSM && (
        <>
          <TopInfoPanelItem
            title={<Trans>sGHO</Trans>}
            withoutIconWrapper
            icon={
              <Box
                mr={3}
                sx={{ mr: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <TokenIcon symbol="sgho" sx={{ width: 40, height: 40 }} />
              </Box>
            }
          >
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <Typography variant={valueTypographyVariant}>Savings GHO</Typography>

              <Box sx={{ display: 'flex' }}>
                <TokenContractTooltip explorerUrl="https://etherscan.io/address/0x1a88Df1cFe15Af22B3c4c783D4e6F7F9e0C1885d" />
              </Box>
            </Box>
          </TopInfoPanelItem>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ my: 1, borderColor: 'rgba(235, 235, 239, 0.08)' }}
          />
        </>
      )}
      <SGhoHeaderUserDetails
        currentMarketData={currentMarketData}
        valueTypographyVariant={valueTypographyVariant}
        symbolsTypographyVariant={symbolsTypographyVariant}
        stkGho={stkGho}
      />
    </TopInfoPanel>
  );
};

const SGhoHeaderUserDetails = ({
  valueTypographyVariant,
  symbolsTypographyVariant,
  stkGho,
}: {
  currentMarketData: MarketDataType;
  valueTypographyVariant: 'main16' | 'main21';
  symbolsTypographyVariant: 'secondary16' | 'secondary21';
  stkGho: StakeTokenFormatted;
}) => {
  const { data: stakeAPR, isLoading: isLoadingStakeAPR } = useStakeTokenAPR();

  return (
    <>
      <TopInfoPanelItem hideIcon title={<Trans>APR</Trans>} loading={isLoadingStakeAPR}>
        <FormattedNumber
          value={stakeAPR?.apr || 0}
          variant={valueTypographyVariant}
          symbolsColor="#A5A8B6"
          visibleDecimals={2}
          percent
          symbolsVariant={symbolsTypographyVariant}
        />
      </TopInfoPanelItem>
      <TopInfoPanelItem
        hideIcon
        title={
          <Stack direction="row" alignItems="center">
            <Trans>Total Deposited</Trans>
          </Stack>
        }
        loading={isLoadingStakeAPR}
      >
        <FormattedNumber
          value={stkGho?.totalSupplyUSDFormatted || '0'}
          symbol="USD"
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor="#A5A8B6"
          visibleDecimals={2}
        />
      </TopInfoPanelItem>
    </>
  );
};
