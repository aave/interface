import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { useMediaQuery, useTheme } from '@mui/material';
import { BigNumber } from 'bignumber.js';
import { PageHeaderStat } from 'src/components/PageHeader/PageHeaderStat';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { ReserveWithId, useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';

export const GhoReserveTopDetails = ({ reserve }: { reserve: ReserveWithId }) => {
  const { loading } = useAppDataContext();
  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  const valueTypographyVariant = downToSM ? 'h4' : 'h2';

  const totalBorrowed = BigNumber.min(
    valueToBigNumber(reserve.borrowInfo?.total.amount.value ?? '0'),
    valueToBigNumber(reserve.borrowInfo?.borrowCap.amount.value ?? '0')
  ).toNumber();

  return (
    <>
      <PageHeaderStat label={<Trans>Total borrowed</Trans>} loading={loading}>
        <FormattedNumber value={totalBorrowed} symbol="USD" variant={valueTypographyVariant} />
      </PageHeaderStat>

      <PageHeaderStat label={<Trans>Maximum available to borrow</Trans>} loading={loading}>
        <FormattedNumber
          value={reserve.borrowInfo?.borrowCap.amount.value ?? '0'}
          symbol="USD"
          variant={valueTypographyVariant}
        />
      </PageHeaderStat>

      <PageHeaderStat
        label={
          <TextWithTooltip
            text={<Trans>Price</Trans>}
            sx={{ lineHeight: '0.875rem', letterSpacing: 0 }}
          >
            <Trans>
              The Aave Protocol is programmed to always use the price of 1 GHO = $1. This is
              different from using market pricing via oracles for other crypto assets. This creates
              stabilizing arbitrage opportunities when the price of GHO fluctuates.
            </Trans>
          </TextWithTooltip>
        }
        loading={loading}
      >
        <FormattedNumber value={1} symbol="USD" variant={valueTypographyVariant} />
      </PageHeaderStat>
    </>
  );
};
