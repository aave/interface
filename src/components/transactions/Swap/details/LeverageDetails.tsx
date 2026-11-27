import { valueToBigNumber } from '@aave/math-utils';
import { ArrowNarrowRightIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Skeleton, SvgIcon, Typography } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';

import {
  DetailsHFLine,
  DetailsIncentivesLine,
  TxModalDetails,
} from '../../FlowCommons/TxModalDetails';
import { ProtocolSwapParams, ProtocolSwapState } from '../types';
import { CowCostsDetails } from './CowCostsDetails';

/** Collateral over equity; undefined without equity to lever. */
const positionLeverage = (collateralUSD: string, debtUSD: string) => {
  const collateral = valueToBigNumber(collateralUSD);
  const equity = collateral.minus(valueToBigNumber(debtUSD));
  if (collateral.lte(0) || equity.lte(0)) return undefined;
  return collateral.div(equity);
};

/** Supply yield less borrow cost of the added exposure, over the collateral bought. */
const netApyOfAddedExposure = ({
  collateralUSD,
  supplyApy,
  debtUSD,
  borrowApy,
}: {
  collateralUSD: string;
  supplyApy: string;
  debtUSD: string;
  borrowApy: string;
}) => {
  const collateral = valueToBigNumber(collateralUSD);
  if (collateral.lte(0)) return undefined;
  return collateral
    .multipliedBy(valueToBigNumber(supplyApy))
    .minus(valueToBigNumber(debtUSD).multipliedBy(valueToBigNumber(borrowApy)))
    .div(collateral);
};

const DetailsSkeletonLine = () => (
  <Skeleton variant="rectangular" height={20} width={100} sx={{ borderRadius: '4px' }} />
);

/** Source is the collateral the order buys and supplies, destination the debt it draws. */
export const LeverageDetails = ({
  state,
}: {
  params: ProtocolSwapParams;
  state: ProtocolSwapState;
}) => {
  const { user } = useAppDataContext();
  const collateral = state.sourceReserve;
  const debt = state.destinationReserve;
  const addedCollateralUSD = state.buyAmountUSD ?? '0';
  const addedDebtUSD = state.sellAmountUSD ?? '0';

  const collateralAfter = valueToBigNumber(collateral.underlyingBalance).plus(
    valueToBigNumber(state.buyAmountFormatted ?? '0')
  );
  const debtAfter = valueToBigNumber(debt.variableBorrows).plus(
    valueToBigNumber(state.sellAmountFormatted ?? '0')
  );

  // Weighted by the amounts bought and drawn, not a bare difference of rates.
  const netApy = netApyOfAddedExposure({
    collateralUSD: addedCollateralUSD,
    supplyApy: collateral.reserve.supplyAPY,
    debtUSD: addedDebtUSD,
    borrowApy: debt.reserve.variableBorrowAPY,
  });

  const totalCollateralUSD = user?.totalCollateralUSD ?? '0';
  const totalDebtUSD = user?.totalBorrowsUSD ?? '0';
  const leverageBefore = positionLeverage(totalCollateralUSD, totalDebtUSD);
  const leverageAfter = positionLeverage(
    valueToBigNumber(totalCollateralUSD).plus(addedCollateralUSD).toString(),
    valueToBigNumber(totalDebtUSD).plus(addedDebtUSD).toString()
  );

  const balanceAfter = (symbol: string, iconSymbol: string, amount: string, priceInUSD: string) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      {state.ratesLoading ? (
        <DetailsSkeletonLine />
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TokenIcon symbol={iconSymbol} sx={{ mr: 2, ml: 4, fontSize: '16px' }} />
            <FormattedNumber value={amount} variant="h5" compact symbol={symbol} />
          </Box>
          <FormattedNumber
            value={valueToBigNumber(amount).multipliedBy(priceInUSD).toString()}
            variant="helperText"
            compact
            symbol="USD"
            symbolsColor="fg-2"
            color="fg-2"
          />
        </>
      )}
    </Box>
  );

  return (
    <TxModalDetails
      gasLimit={state.gasLimit}
      chainId={state.chainId}
      showGasStation={state.showGasStation}
    >
      <CowCostsDetails state={state} />

      {user && (
        <DetailsHFLine
          healthFactor={user.healthFactor}
          futureHealthFactor={state.hfAfterSwap?.toString() ?? user.healthFactor}
          visibleHfChange={!!state.buyAmountFormatted}
          loading={state.ratesLoading}
        />
      )}

      {leverageBefore && (
        <Row caption={<Trans>Leverage</Trans>} captionVariant="description" mb={4}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {state.ratesLoading ? (
              <DetailsSkeletonLine />
            ) : (
              <>
                <Typography variant="h5">{`${leverageBefore.toFixed(2)}x`}</Typography>
                {leverageAfter && (
                  <>
                    <SvgIcon color="primary" sx={{ fontSize: '14px', mx: 1 }}>
                      <ArrowNarrowRightIcon />
                    </SvgIcon>
                    <Typography variant="h5">{`${leverageAfter.toFixed(2)}x`}</Typography>
                  </>
                )}
              </>
            )}
          </Box>
        </Row>
      )}

      <Row caption={<Trans>Net APY</Trans>} captionVariant="description" mb={4}>
        {state.ratesLoading || !netApy ? (
          <DetailsSkeletonLine />
        ) : (
          <FormattedNumber value={netApy.toString()} variant="h5" percent />
        )}
      </Row>

      <DetailsIncentivesLine
        incentives={collateral.reserve.aIncentivesData}
        symbol={collateral.reserve.symbol}
        loading={state.ratesLoading}
      />

      <Row caption={<Trans>Collateral after</Trans>} captionVariant="description" mb={4}>
        {balanceAfter(
          collateral.reserve.symbol,
          collateral.reserve.iconSymbol,
          collateralAfter.toString(),
          collateral.reserve.priceInUSD
        )}
      </Row>

      <Row caption={<Trans>Borrow balance after</Trans>} captionVariant="description" mb={4}>
        {balanceAfter(
          debt.reserve.symbol,
          debt.reserve.iconSymbol,
          debtAfter.toString(),
          debt.reserve.priceInUSD
        )}
      </Row>
    </TxModalDetails>
  );
};
