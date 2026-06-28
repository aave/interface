import { Trans } from '@lingui/macro';
import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import NumberFlow from '@number-flow/react';
import { BigNumber } from 'bignumber.js';
import { useEffect, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { TopInfoPanel } from 'src/components/TopInfoPanel/TopInfoPanel';
import { useSGhoVaultContext } from 'src/modules/sGho/SGhoVaultContext';
import { useRootStore } from 'src/store/root';

import { TopInfoPanelItem } from '../../components/TopInfoPanel/TopInfoPanelItem';

export const SGHOHeader: React.FC = () => {
  const theme = useTheme();
  const trackEvent = useRootStore((store) => store.trackEvent);
  const { vault, loading } = useSGhoVaultContext();

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'sGHO',
    });
  }, [trackEvent]);

  const upToLG = useMediaQuery(theme.breakpoints.up('lg'));
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const valueTypographyVariant = downToSM ? 'main16' : 'main21';
  const symbolsTypographyVariant = downToSM ? 'secondary16' : 'secondary21';
  const symbolsColor = theme.palette.text.muted;
  const iconSize = valueTypographyVariant === 'main21' ? 20 : 16;

  const apr = vault?.targetRate ? +vault.targetRate.value : 0;
  const totalDepositedUSD = vault?.totalAssets?.usd ?? '0';

  const totalAssetsValue = vault?.totalAssets ? +vault.totalAssets.amount.value : 0;
  const totalAssetsUsdValue = vault?.totalAssets ? +vault.totalAssets.usd : 0;
  const totalSupplyValue = vault?.totalSupply ? +vault.totalSupply.value : 0;
  // Share price in USD: total assets in USD / total shares. Falls back to 1 when the vault is empty.
  const sharePrice =
    totalSupplyValue > 0 && totalAssetsValue > 0 ? totalAssetsUsdValue / totalSupplyValue : 1;

  // Weekly rewards estimate: (user balance × APR) / 52
  const userBalance = vault?.user?.balance.amount.value ?? '0';
  const balanceBN = new BigNumber(userBalance);
  const aprBN = new BigNumber(apr);
  const weeklyRewardsEstimate = balanceBN.multipliedBy(aprBN).dividedBy(52).toNumber();

  const [displayedWeeklyRewards, setDisplayedWeeklyRewards] = useState(0);
  useEffect(() => {
    setDisplayedWeeklyRewards(Math.max(0, weeklyRewardsEstimate));
  }, [weeklyRewardsEstimate]);

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
              Deposit GHO into Savings GHO (sGHO) and earn{' '}
              <Box component="span" sx={{ color: '#338E3C', fontWeight: 'bold' }}>
                {(apr * 100).toFixed(2)}%
              </Box>{' '}
              APR on your GHO holdings. There are no lockups, no rehypothecation, and you can
              withdraw anytime. Simply deposit GHO, receive sGHO tokens representing your balance,
              and watch your savings grow.
            </Trans>
          </Typography>
        </Box>
      }
    >
      <TopInfoPanelItem hideIcon title={<Trans>Current APR</Trans>} loading={loading}>
        <FormattedNumber
          value={apr}
          variant={valueTypographyVariant}
          symbolsColor={symbolsColor}
          visibleDecimals={2}
          percent
          symbolsVariant={symbolsTypographyVariant}
        />
      </TopInfoPanelItem>

      <TopInfoPanelItem hideIcon title={<Trans>Total Deposited</Trans>} loading={loading}>
        <FormattedNumber
          value={totalDepositedUSD}
          symbol="USD"
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor={symbolsColor}
          visibleDecimals={2}
        />
      </TopInfoPanelItem>

      <TopInfoPanelItem hideIcon title={<Trans>Price</Trans>} loading={loading}>
        <FormattedNumber
          value={sharePrice}
          symbol="USD"
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor={symbolsColor}
          visibleDecimals={2}
        />
      </TopInfoPanelItem>

      <TopInfoPanelItem
        hideIcon
        title={
          <Stack direction="row" alignItems="center">
            <TextWithTooltip text={<Trans>Weekly Rewards</Trans>} variant="inherit">
              <Trans>
                Estimated weekly rewards based on your current sGHO balance and APR. Actual rewards
                may vary depending on market conditions.
              </Trans>
            </TextWithTooltip>
          </Stack>
        }
        loading={loading}
      >
        {balanceBN.gt(0) ? (
          <Typography
            variant={valueTypographyVariant}
            sx={{
              display: 'inline-flex',
              flexDirection: 'row',
              alignItems: 'center',
              position: 'relative',
              '& number-flow-react.custom-number-flow': {
                '--number-flow-mask-height': '0',
                '--number-flow-char-height': '1em',
                fontVariantNumeric: 'tabular-nums',
                display: 'inline-block',
                verticalAlign: 'baseline',
                paddingLeft: '12px',
                paddingRight: '12px',
                paddingTop: '2px',
              },
            }}
            noWrap
          >
            <NumberFlow
              value={displayedWeeklyRewards}
              format={{
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }}
              style={{
                color: 'inherit',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                fontWeight: 'inherit',
                lineHeight: 'inherit',
              }}
              className="custom-number-flow"
            />
            <TokenIcon symbol="sgho" sx={{ ml: 0.5, width: iconSize, height: iconSize }} />
          </Typography>
        ) : (
          <Typography variant={valueTypographyVariant} color={symbolsColor}>
            —
          </Typography>
        )}
      </TopInfoPanelItem>
    </TopInfoPanel>
  );
};
