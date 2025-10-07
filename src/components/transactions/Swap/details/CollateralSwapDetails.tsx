import { normalizeBN, valueToBigNumber } from '@aave/math-utils';
import { ArrowNarrowRightIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Skeleton, SvgIcon } from '@mui/material';
import React from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { CollateralType } from 'src/helpers/types';
import {
  ComputedReserveData,
  ComputedUserReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { getDebtCeilingData } from 'src/hooks/useAssetCaps';
import { calculateHFAfterSwap } from 'src/utils/hfUtils';

import {
  CollateralState,
  DetailsHFLine,
  DetailsIncentivesLine,
  DetailsNumberLine,
  TxModalDetails,
} from '../../FlowCommons/TxModalDetails';
import { getAssetCollateralType } from '../../utils';
import { SwapParams, SwapState } from '../types';

export const ColalteralSwapDetails = ({ state }: { params: SwapParams; state: SwapState }) => {
  const { user, reserves } = useAppDataContext();

  if (!state.swapRate || !user) {
    return null;
  }

  // Map selected tokens to reserves and user reserves
  const poolReserve = reserves.find(
    (r) => r.underlyingAsset.toLowerCase() === state.sourceToken.underlyingAddress.toLowerCase()
  ) as ComputedReserveData | undefined;
  const targetReserve = reserves.find(
    (r) =>
      r.underlyingAsset.toLowerCase() === state.destinationToken.underlyingAddress.toLowerCase()
  ) as ComputedReserveData | undefined;

  if (!poolReserve || !targetReserve || !user) {
    console.error(
      'Pool reserve or target reserve or user not found',
      state.sourceToken.underlyingAddress,
      state.destinationToken.underlyingAddress
    );
    return null;
  }

  const userReserve = user.userReservesData.find(
    (ur) => ur.underlyingAsset.toLowerCase() === poolReserve.underlyingAsset.toLowerCase()
  ) as ComputedUserReserveData | undefined;
  const userTargetReserve = user.userReservesData.find(
    (ur) => ur.underlyingAsset.toLowerCase() === targetReserve.underlyingAsset.toLowerCase()
  ) as ComputedUserReserveData | undefined;

  if (!userReserve || !userTargetReserve) {
    return null;
  }

  // Show HF only when there are borrows and source reserve is collateralizable
  const showHealthFactor =
    user.totalBorrowsMarketReferenceCurrency !== '0' &&
    poolReserve.reserveLiquidationThreshold !== '0';

  // Amounts in human units (mirror other components: intent uses destSpot, market uses destAmount)
  const fromAmount = normalizeBN(state.swapRate.srcAmount, state.swapRate.srcDecimals).toString();
  const toAmountRaw = normalizeBN(
    state.swapRate.provider === 'cowprotocol' ? state.swapRate.destSpot : state.swapRate.destAmount,
    state.swapRate.destDecimals
  ).toString();
  const toAmountAfterSlippage = valueToBigNumber(toAmountRaw)
    .multipliedBy(1 - state.safeSlippage)
    .toString();

  // Compute collateral types
  const { debtCeilingReached: sourceDebtCeiling } = getDebtCeilingData(targetReserve);
  const swapSourceCollateralType: CollateralType = getAssetCollateralType(
    userReserve,
    user.totalCollateralUSD,
    user.isInIsolationMode,
    sourceDebtCeiling
  );
  const { debtCeilingReached: targetDebtCeiling } = getDebtCeilingData(targetReserve);
  const swapTargetCollateralType: CollateralType = getAssetCollateralType(
    userTargetReserve,
    user.totalCollateralUSD,
    user.isInIsolationMode,
    targetDebtCeiling
  );

  // Health factor after swap using slippage-adjusted output amount
  const { hfAfterSwap } = calculateHFAfterSwap({
    fromAmount,
    fromAssetData: poolReserve,
    fromAssetUserData: userReserve,
    user,
    toAmountAfterSlippage: toAmountAfterSlippage,
    toAssetData: targetReserve,
  });

  const sourceAmountAfterSwap = valueToBigNumber(userReserve.underlyingBalance).minus(
    valueToBigNumber(fromAmount)
  );

  const targetAmountAfterSwap = valueToBigNumber(userTargetReserve.underlyingBalance).plus(
    valueToBigNumber(toAmountAfterSlippage)
  );

  const skeleton: JSX.Element = (
    <>
      <Skeleton variant="rectangular" height={20} width={100} sx={{ borderRadius: '4px' }} />
      <Skeleton
        variant="rectangular"
        height={15}
        width={80}
        sx={{ borderRadius: '4px', marginTop: '4px' }}
      />
    </>
  );

  const showBalance = true;

  return (
    <TxModalDetails
      gasLimit={state.gasLimit}
      chainId={state.chainId}
      showGasStation={state.swapRate.provider !== 'cowprotocol'}
    >
      {hfAfterSwap && (
        <DetailsHFLine
          healthFactor={user.healthFactor}
          futureHealthFactor={hfAfterSwap.toString()}
          visibleHfChange={showHealthFactor}
          loading={state.ratesLoading}
        />
      )}
      <DetailsNumberLine
        description={<Trans>Supply apy</Trans>}
        value={userReserve.reserve.supplyAPY}
        futureValue={userTargetReserve.reserve.supplyAPY}
        percent
        loading={state.ratesLoading}
      />
      <Row caption={<Trans>Collateralization</Trans>} captionVariant="description" mb={4}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          {state.ratesLoading ? (
            <Skeleton variant="rectangular" height={20} width={100} sx={{ borderRadius: '4px' }} />
          ) : (
            <>
              <CollateralState collateralType={swapSourceCollateralType} />

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SvgIcon color="primary" sx={{ fontSize: '14px', mx: 1 }}>
                  <ArrowNarrowRightIcon />
                </SvgIcon>

                <CollateralState collateralType={swapTargetCollateralType} />
              </Box>
            </>
          )}
        </Box>
      </Row>
      <DetailsIncentivesLine
        incentives={userReserve.reserve.aIncentivesData}
        symbol={userReserve.reserve.symbol}
        futureIncentives={userTargetReserve.reserve.aIncentivesData}
        futureSymbol={userTargetReserve.reserve.symbol}
        loading={state.ratesLoading}
      />
      <DetailsNumberLine
        description={<Trans>Liquidation threshold</Trans>}
        value={userReserve.reserve.formattedReserveLiquidationThreshold}
        futureValue={userTargetReserve.reserve.formattedReserveLiquidationThreshold}
        percent
        visibleDecimals={0}
        loading={state.ratesLoading}
      />

      {showBalance && (
        <Row
          caption={<Trans>Supply balance after switch</Trans>}
          captionVariant="description"
          mb={4}
          align="flex-start"
        >
          <Box sx={{ textAlign: 'right' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}
            >
              {state.ratesLoading ? (
                skeleton
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TokenIcon
                      symbol={userReserve.reserve.iconSymbol}
                      sx={{ mr: 2, ml: 4, fontSize: '16px' }}
                    />
                    <FormattedNumber
                      value={sourceAmountAfterSwap.toString()}
                      variant="secondary14"
                      compact
                    />
                  </Box>
                  <FormattedNumber
                    value={sourceAmountAfterSwap
                      .multipliedBy(valueToBigNumber(userReserve.reserve.priceInUSD))
                      .toString()}
                    variant="helperText"
                    compact
                    symbol="USD"
                    symbolsColor="text.secondary"
                    color="text.secondary"
                  />
                </>
              )}
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}
              mt={2}
            >
              {state.ratesLoading ? (
                skeleton
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TokenIcon
                      symbol={userTargetReserve.reserve.iconSymbol}
                      sx={{ mr: 2, ml: 4, fontSize: '16px' }}
                    />
                    <FormattedNumber
                      value={targetAmountAfterSwap.toString()}
                      variant="secondary14"
                      compact
                    />
                  </Box>
                  <FormattedNumber
                    value={targetAmountAfterSwap
                      .multipliedBy(valueToBigNumber(userTargetReserve.reserve.priceInUSD))
                      .toString()}
                    variant="helperText"
                    compact
                    symbol="USD"
                    symbolsColor="text.secondary"
                    color="text.secondary"
                  />
                </>
              )}
            </Box>
          </Box>
        </Row>
      )}
    </TxModalDetails>
  );
};
