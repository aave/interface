import { valueToBigNumber } from '@aave/math-utils';
import { ArrowNarrowRightIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Skeleton, SvgIcon, Typography } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import {
  DetailsHFLine,
  DetailsIncentivesLine,
  TxModalDetails,
} from 'src/components/transactions/FlowCommons/TxModalDetails';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';

import {
  leverageAfterAdding,
  netApyOfAddedExposure,
  positionLeverage,
} from '../helpers/shared/leverage.helpers';
import { ProtocolSwapParams, ProtocolSwapState } from '../types';
import { CowCostsDetails } from './CowCostsDetails';

/**
 * Source is the collateral the swap buys and supplies, destination is the debt it draws, so both
 * balances grow. The health factor is the number that decides whether the position is sane, which
 * is why it leads.
 */
export const LeverageDetails = ({
  state,
}: {
  params: ProtocolSwapParams;
  state: ProtocolSwapState;
}) => {
  const { user } = useAppDataContext();

  const collateralAfter = valueToBigNumber(state.sourceReserve.underlyingBalance).plus(
    valueToBigNumber(state.buyAmountFormatted ?? '0')
  );
  const debtAfter = valueToBigNumber(state.destinationReserve.variableBorrows).plus(
    valueToBigNumber(state.sellAmountFormatted ?? '0')
  );

  const collateralAfterUSD = collateralAfter.multipliedBy(
    valueToBigNumber(state.sourceReserve.reserve.priceInUSD)
  );
  const debtAfterUSD = debtAfter.multipliedBy(
    valueToBigNumber(state.destinationReserve.reserve.priceInUSD)
  );

  // Weighted by the amounts actually supplied and borrowed, not a bare difference of rates.
  const netApy = netApyOfAddedExposure({
    collateralUSD: state.buyAmountUSD ?? '0',
    supplyApy: state.sourceReserve.reserve.supplyAPY,
    debtUSD: state.sellAmountUSD ?? '0',
    borrowApy: state.destinationReserve.reserve.variableBorrowAPY,
  });

  const collateralUSD = user?.totalCollateralUSD ?? '0';
  const debtUSD = user?.totalBorrowsUSD ?? '0';
  const leverageBefore = positionLeverage(collateralUSD, debtUSD);
  const leverageAfter = leverageAfterAdding({
    collateralUSD,
    debtUSD,
    addedCollateralUSD: state.buyAmountUSD ?? '0',
    addedDebtUSD: state.sellAmountUSD ?? '0',
  });

  const balanceAfter = (symbol: string, iconSymbol: string, amount: string, amountUSD: string) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      {state.ratesLoading ? (
        <Skeleton variant="rectangular" height={20} width={100} sx={{ borderRadius: '4px' }} />
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TokenIcon symbol={iconSymbol} sx={{ mr: 2, ml: 4, fontSize: '16px' }} />
            <FormattedNumber value={amount} variant="secondary14" compact symbol={symbol} />
          </Box>
          <FormattedNumber
            value={amountUSD}
            variant="helperText"
            compact
            symbol="USD"
            symbolsColor="text.secondary"
            color="text.secondary"
          />
        </>
      )}
    </Box>
  );

  return (
    <TxModalDetails gasLimit={state.gasLimit} showGasStation={state.showGasStation}>
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
              <Skeleton
                variant="rectangular"
                height={20}
                width={100}
                sx={{ borderRadius: '4px' }}
              />
            ) : (
              <>
                <Typography variant="secondary14">{`${leverageBefore.toFixed(2)}×`}</Typography>
                {leverageAfter && (
                  <>
                    <SvgIcon color="primary" sx={{ fontSize: '14px', mx: 1 }}>
                      <ArrowNarrowRightIcon />
                    </SvgIcon>
                    <Typography variant="secondary14">{`${leverageAfter.toFixed(2)}×`}</Typography>
                  </>
                )}
              </>
            )}
          </Box>
        </Row>
      )}

      <Row caption={<Trans>Net apy</Trans>} captionVariant="description" mb={4}>
        {state.ratesLoading || !netApy ? (
          <Skeleton variant="rectangular" height={20} width={100} sx={{ borderRadius: '4px' }} />
        ) : (
          <FormattedNumber value={netApy.toString()} variant="secondary14" percent />
        )}
      </Row>

      <DetailsIncentivesLine
        incentives={state.sourceReserve.reserve.aIncentivesData}
        symbol={state.sourceReserve.reserve.symbol}
        loading={state.ratesLoading}
      />

      <Row caption={<Trans>Collateral after</Trans>} captionVariant="description" mb={4}>
        {balanceAfter(
          state.sourceReserve.reserve.symbol,
          state.sourceReserve.reserve.iconSymbol,
          collateralAfter.toString(),
          collateralAfterUSD.toString()
        )}
      </Row>

      <Row caption={<Trans>Borrow balance after</Trans>} captionVariant="description" mb={4}>
        {balanceAfter(
          state.destinationReserve.reserve.symbol,
          state.destinationReserve.reserve.iconSymbol,
          debtAfter.toString(),
          debtAfterUSD.toString()
        )}
      </Row>
    </TxModalDetails>
  );
};
