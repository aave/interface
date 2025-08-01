import { Trans } from '@lingui/macro';
import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { TopInfoPanel } from 'src/components/TopInfoPanel/TopInfoPanel';
import { StakeTokenFormatted, useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { useStakeTokenAPR } from 'src/hooks/useStakeTokenAPR';
import { useRootStore } from 'src/store/root';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { GENERAL } from 'src/utils/events';
import { useShallow } from 'zustand/shallow';

import { Link } from '../../components/primitives/Link';
import { TopInfoPanelItem } from '../../components/TopInfoPanel/TopInfoPanelItem';

export const SGHOHeader: React.FC = () => {
  const theme = useTheme();
  const [currentMarketData, trackEvent] = useRootStore(
    useShallow((store) => [store.currentMarketData, store.trackEvent])
  );

  const { data: stakeGeneralResult } = useGeneralStakeUiData(currentMarketData);

  const { data: stakeAPR } = useStakeTokenAPR();

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'sGHO',
    });
  }, [trackEvent]);

  let stkGho: StakeTokenFormatted | undefined;

  if (stakeGeneralResult && Array.isArray(stakeGeneralResult)) {
    [, , stkGho] = stakeGeneralResult;
  }

  const upToLG = useMediaQuery(theme.breakpoints.up('lg'));
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const valueTypographyVariant = downToSM ? 'main16' : 'main21';
  const symbolsTypographyVariant = downToSM ? 'secondary16' : 'secondary21';

  if (!stkGho) return null;

  return (
    <TopInfoPanel
      titleComponent={
        <Box mb={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <TokenIcon symbol="sgho" sx={{ width: 32, height: 32 }} />

            <Typography
              variant={downToXSM ? 'h2' : upToLG ? 'display1' : 'h1'}
              sx={{ ml: 2, mr: 3 }}
            >
              <Trans>Savings GHO</Trans>
            </Typography>
          </Box>

          <Typography sx={{ color: '#8E92A3', maxWidth: '824px' }}>
            <Trans>
              Deposit GHO into savings GHO (sGHO) and earn{' '}
              <Box component="span" sx={{ color: '#338E3C', fontWeight: 'bold' }}>
                {(stakeAPR?.aprPercentage || 0).toFixed(2)}%
              </Box>{' '}
              APR on your GHO holdings. Your funds are safe with no risk of slashing, and you can
              withdraw anytime instantly without penalties or delays. Simply deposit GHO, receive
              sGHO tokens representing your balance, and watch your savings earning claimable
              rewards from merit.
            </Trans>{' '}
            <Link
              href="https://aave.com/docs/primitives/umbrella"
              sx={{ textDecoration: 'underline', color: '#8E92A3' }}
              onClick={() =>
                trackEvent(GENERAL.EXTERNAL_LINK, {
                  Link: 'Staking Risks',
                })
              }
            >
              <Trans>Learn more about the risks.</Trans>
            </Link>
          </Typography>
        </Box>
      }
    >
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
      <TopInfoPanelItem
        hideIcon
        title={
          <Stack direction="row" alignItems="center">
            <Trans>Price</Trans>
          </Stack>
        }
        loading={isLoadingStakeAPR}
      >
        <FormattedNumber
          value={stkGho?.stakeTokenPriceUSDFormatted || '0'}
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
