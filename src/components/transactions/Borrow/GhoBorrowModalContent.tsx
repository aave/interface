import {
  calculateHealthFactorFromBalancesBigUnits,
  USD_DECIMALS,
  valueToBigNumber,
} from '@aave/math-utils';
import { ArrowNarrowRightIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon, Typography } from '@mui/material';
import React, { useState } from 'react';
import {
  GhoIncentivesCard,
  GhoIncentivesCardProps,
} from 'src/components/incentives/GhoIncentivesCard';
import { FixedAPYTooltip } from 'src/components/infoTooltips/FixedAPYTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { ROUTES } from 'src/components/primitives/Link';
import { NoData } from 'src/components/primitives/NoData';
import { Row } from 'src/components/primitives/Row';
import {
  ExtendedFormattedUser,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useGhoPoolReserve } from 'src/hooks/pool/useGhoPoolReserve';
import { useUserGhoPoolReserve } from 'src/hooks/pool/useUserGhoPoolReserve';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { getMaxGhoMintAmount } from 'src/utils/getMaxAmountAvailableToBorrow';
import { ghoUserQualifiesForDiscount, weightedAverageAPY } from 'src/utils/ghoUtilities';
import { roundToTokenDecimals } from 'src/utils/utils';

import { CapType } from '../../caps/helper';
import { AssetInput } from '../AssetInput';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import { DetailsHFLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
import { BorrowActions } from './BorrowActions';
import { BorrowAmountWarning } from './BorrowAmountWarning';
import { GhoBorrowSuccessView } from './GhoBorrowSuccessView';
import { ParameterChangewarning } from './ParameterChangewarning';

export enum ErrorType {
  STABLE_RATE_NOT_ENABLED,
  NOT_ENOUGH_LIQUIDITY,
  BORROWING_NOT_AVAILABLE,
  NOT_ENOUGH_BORROWED,
}

export const GhoBorrowModalContent = ({
  underlyingAsset,
  isWrongNetwork,
  poolReserve,
  symbol,
  user,
}: ModalWrapperProps & { user: ExtendedFormattedUser }) => {
  const { mainTxState: borrowTxState, gasLimit, txError, close: closeModal } = useModalContext();
  const currentMarketData = useRootStore((state) => state.currentMarketData);
  const currentMarket = useRootStore((state) => state.currentMarket);
  const { marketReferencePriceInUsd, ghoReserveData, ghoUserData, ghoLoadingData } =
    useAppDataContext();
  const { data: _ghoUserData } = useUserGhoPoolReserve(currentMarketData);
  const { data: _ghoReserveData } = useGhoPoolReserve(currentMarketData);
  const { borrowCap } = useAssetCaps();

  const [amount, setAmount] = useState('');
  const [riskCheckboxAccepted, setRiskCheckboxAccepted] = useState(false);

  // Check if user has any open borrow positions on GHO
  // Check if user can borrow at a discount
  const hasGhoBorrowPositions = ghoUserData.userGhoBorrowBalance > 0;
  const userStakedAaveBalance: number = ghoUserData.userDiscountTokenBalance;
  const discountAvailable =
    _ghoUserData && _ghoReserveData
      ? ghoUserQualifiesForDiscount(_ghoReserveData, _ghoUserData, amount)
      : false;

  // amount calculations
  let maxAmountToBorrow = getMaxGhoMintAmount(user, poolReserve);
  maxAmountToBorrow = Math.min(
    Number(maxAmountToBorrow),
    ghoReserveData.aaveFacilitatorRemainingCapacity
  ).toFixed(10);

  // We set this in a useEffect, so it doesn't constantly change when
  // max amount selected
  const handleChange = (_value: string) => {
    if (_value === '-1') {
      setAmount(maxAmountToBorrow);
    } else {
      const decimalTruncatedValue = roundToTokenDecimals(_value, poolReserve.decimals);
      setAmount(decimalTruncatedValue);
    }
  };

  const isMaxSelected = amount === maxAmountToBorrow;

  // health factor calculations
  const amountToBorrowInUsd = valueToBigNumber(amount)
    .multipliedBy(poolReserve.formattedPriceInMarketReferenceCurrency)
    .multipliedBy(marketReferencePriceInUsd)
    .shiftedBy(-USD_DECIMALS);

  const newHealthFactor = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency: user.totalCollateralUSD,
    borrowBalanceMarketReferenceCurrency: valueToBigNumber(user.totalBorrowsUSD).plus(
      amountToBorrowInUsd
    ),
    currentLiquidationThreshold: user.currentLiquidationThreshold,
  });
  const displayRiskCheckbox =
    newHealthFactor.toNumber() < 1.5 && newHealthFactor.toString() !== '-1';

  // calculating input usd value
  const usdValue = valueToBigNumber(amount).multipliedBy(poolReserve.priceInUSD);

  const currentDiscountedAmount =
    ghoUserData.userGhoBorrowBalance >= ghoReserveData.ghoMinDebtTokenBalanceForDiscount
      ? ghoUserData.userGhoAvailableToBorrowAtDiscount
      : 0;
  const currentBorrowAPY = weightedAverageAPY(
    ghoReserveData.ghoVariableBorrowAPY,
    ghoUserData.userGhoBorrowBalance,
    currentDiscountedAmount,
    ghoReserveData.ghoBorrowAPYWithMaxDiscount
  );

  const futureDiscountedAmount =
    ghoUserData.userGhoBorrowBalance + Number(amount) >=
    ghoReserveData.ghoMinDebtTokenBalanceForDiscount
      ? ghoUserData.userGhoAvailableToBorrowAtDiscount
      : 0;
  const futureBorrowAPY = weightedAverageAPY(
    ghoReserveData.ghoVariableBorrowAPY,
    ghoUserData.userGhoBorrowBalance + Number(amount),
    futureDiscountedAmount,
    ghoReserveData.ghoBorrowAPYWithMaxDiscount
  );

  // error types handling
  let blockingError: ErrorType | undefined = undefined;
  if (!poolReserve.borrowingEnabled) {
    blockingError = ErrorType.BORROWING_NOT_AVAILABLE;
  }

  // error render handling
  const BlockingError = () => {
    switch (blockingError) {
      case ErrorType.BORROWING_NOT_AVAILABLE:
        return <Trans>Borrowing is currently unavailable for {poolReserve.symbol}.</Trans>;
      default:
        return <></>;
    }
  };

  const iconSymbol = poolReserve.iconSymbol;

  if (borrowTxState.success)
    return (
      <GhoBorrowSuccessView action={<Trans>Borrowed</Trans>} amount={amount} symbol={iconSymbol} />
    );

  return (
    <>
      {borrowCap.determineWarningDisplay({ borrowCap })}

      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={usdValue.toString(10)}
        assets={[
          {
            balance: maxAmountToBorrow,
            symbol,
            iconSymbol,
          },
        ]}
        symbol={symbol}
        capType={CapType.borrowCap}
        isMaxSelected={isMaxSelected}
        maxValue={maxAmountToBorrow}
        balanceText={<Trans>Available</Trans>}
      />

      {blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          <BlockingError />
        </Typography>
      )}

      <TxModalDetails gasLimit={gasLimit}>
        <DetailsHFLine
          visibleHfChange={!!amount}
          healthFactor={user.healthFactor}
          futureHealthFactor={newHealthFactor.toString(10)}
        />
        <Row
          caption={
            <Box>
              <FixedAPYTooltip
                text={<Trans>APY, borrow rate</Trans>}
                variant="subheader2"
                color="text.secondary"
              />
            </Box>
          }
          captionVariant="description"
          mb={4}
          align="flex-start"
        >
          <Box sx={{ textAlign: 'right' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <BorrowAPY
                ghoLoadingData={ghoLoadingData}
                hasGhoBorrowPositions={hasGhoBorrowPositions}
                borrowAmount={amount}
                discountAvailable={discountAvailable}
                userDiscountTokenBalance={ghoUserData.userDiscountTokenBalance}
                underlyingAsset={underlyingAsset}
                customMarket={currentMarket}
                currentBorrowAPY={currentBorrowAPY}
                futureBorrowAPY={futureBorrowAPY}
                onDetailsClick={() => closeModal()}
              />
            </Box>
          </Box>
        </Row>
        {discountAvailable && (
          <Typography variant="helperText" color="text.secondary">
            <Trans>
              Discount applied for{' '}
              <FormattedNumber
                variant="helperText"
                color="text.secondary"
                visibleDecimals={2}
                value={userStakedAaveBalance}
              />{' '}
              staking AAVE
            </Trans>
          </Typography>
        )}
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      {displayRiskCheckbox && (
        <BorrowAmountWarning
          riskCheckboxAccepted={riskCheckboxAccepted}
          onRiskCheckboxChange={() => {
            setRiskCheckboxAccepted(!riskCheckboxAccepted);
          }}
        />
      )}

      <ParameterChangewarning underlyingAsset={underlyingAsset} />

      <BorrowActions
        poolReserve={poolReserve}
        amountToBorrow={amount}
        poolAddress={poolReserve.underlyingAsset}
        isWrongNetwork={isWrongNetwork}
        symbol={symbol}
        blocked={blockingError !== undefined || (displayRiskCheckbox && !riskCheckboxAccepted)}
        sx={displayRiskCheckbox ? { mt: 0 } : {}}
      />
    </>
  );
};

interface BorrowAPYProps {
  ghoLoadingData: boolean;
  hasGhoBorrowPositions: boolean;
  borrowAmount: string;
  discountAvailable: boolean;
  userDiscountTokenBalance: number;
  underlyingAsset: string;
  customMarket: CustomMarket;
  currentBorrowAPY: number;
  futureBorrowAPY: number;
  onDetailsClick: () => void;
}
const BorrowAPY = ({
  ghoLoadingData,
  hasGhoBorrowPositions,
  borrowAmount,
  discountAvailable,
  userDiscountTokenBalance,
  underlyingAsset,
  customMarket,
  currentBorrowAPY,
  futureBorrowAPY,
  onDetailsClick,
}: BorrowAPYProps) => {
  if (ghoLoadingData || (!hasGhoBorrowPositions && borrowAmount === '' && discountAvailable)) {
    return <NoData variant="secondary14" color="text.secondary" />;
  }

  type SharedIncentiveProps = Omit<GhoIncentivesCardProps, 'value' | 'borrowAmount'> & {
    'data-cy': string;
  };

  const sharedIncentiveProps: SharedIncentiveProps = {
    stkAaveBalance: userDiscountTokenBalance || 0,
    ghoRoute: ROUTES.reserveOverview(underlyingAsset, customMarket) + '/#discount',
    userQualifiesForDiscount: discountAvailable,
    'data-cy': `apyType`,
  };

  if (!hasGhoBorrowPositions && borrowAmount !== '') {
    return (
      <GhoIncentivesCard
        withTokenIcon={discountAvailable}
        value={futureBorrowAPY}
        {...sharedIncentiveProps}
      />
    );
  }

  if (hasGhoBorrowPositions && borrowAmount === '') {
    return (
      <GhoIncentivesCard
        withTokenIcon={discountAvailable}
        value={currentBorrowAPY}
        onMoreDetailsClick={onDetailsClick}
        {...sharedIncentiveProps}
      />
    );
  }

  if (!discountAvailable) {
    return (
      <GhoIncentivesCard
        value={currentBorrowAPY}
        onMoreDetailsClick={onDetailsClick}
        {...sharedIncentiveProps}
      />
    );
  }

  if (discountAvailable) {
    return (
      <>
        <GhoIncentivesCard
          withTokenIcon
          value={currentBorrowAPY}
          onMoreDetailsClick={onDetailsClick}
          {...sharedIncentiveProps}
        />
        {!!borrowAmount && (
          <>
            {hasGhoBorrowPositions && (
              <SvgIcon color="primary" sx={{ fontSize: '14px', mx: 1 }}>
                <ArrowNarrowRightIcon />
              </SvgIcon>
            )}
            <GhoIncentivesCard
              value={ghoLoadingData ? -1 : futureBorrowAPY}
              {...sharedIncentiveProps}
            />
          </>
        )}
      </>
    );
  }

  return <NoData variant="secondary14" color="text.secondary" />;
};
