import { Trans } from '@lingui/macro';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import NumberFlow from '@number-flow/react';
import { BigNumber } from 'bignumber.js';
import { useEffect, useState } from 'react';
import { PageHeader } from 'src/components/PageHeader/PageHeader';
import { PageHeaderStat } from 'src/components/PageHeader/PageHeaderStat';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { useSGhoVaultContext } from 'src/modules/sGho/SGhoVaultContext';
import { useRootStore } from 'src/store/root';
import { convertAprToApy } from 'src/utils/utils';

export const SGHOHeader: React.FC = () => {
  const theme = useTheme();
  const trackEvent = useRootStore((store) => store.trackEvent);
  const { vault, loading } = useSGhoVaultContext();

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'sGHO',
    });
  }, [trackEvent]);

  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  const valueTypographyVariant = downToSM ? 'h4' : 'h2';
  const iconSize = valueTypographyVariant === 'h2' ? 20 : 16;

  const apr = vault?.targetRate ? +vault.targetRate.value : 0;
  const apyPercent = (convertAprToApy(apr) * 100).toFixed(2);
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
    <PageHeader
      title={<Trans>Savings GHO</Trans>}
      titleIcon={<TokenIcon symbol="sgho" sx={{ width: 32, height: 32 }} />}
      description={
        <Trans>
          Deposit GHO into Savings GHO (sGHO) and earn {apyPercent}% APY on your GHO holdings.
        </Trans>
      }
    >
      <PageHeaderStat label={<Trans>Current APR</Trans>} loading={loading}>
        <FormattedNumber value={apr} variant={valueTypographyVariant} visibleDecimals={2} percent />
      </PageHeaderStat>

      <PageHeaderStat label={<Trans>Total Deposited</Trans>} loading={loading}>
        <FormattedNumber
          value={totalDepositedUSD}
          symbol="USD"
          variant={valueTypographyVariant}
          visibleDecimals={2}
        />
      </PageHeaderStat>

      <PageHeaderStat label={<Trans>Price</Trans>} loading={loading}>
        <FormattedNumber
          value={sharePrice}
          symbol="USD"
          variant={valueTypographyVariant}
          visibleDecimals={2}
        />
      </PageHeaderStat>

      <PageHeaderStat
        label={
          <TextWithTooltip text={<Trans>Weekly Rewards</Trans>} variant="inherit">
            <Trans>
              Estimated weekly rewards based on your current sGHO balance and APR. Actual rewards
              may vary depending on market conditions.
            </Trans>
          </TextWithTooltip>
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
          <Typography variant={valueTypographyVariant} color="fg-3">
            —
          </Typography>
        )}
      </PageHeaderStat>
    </PageHeader>
  );
};
