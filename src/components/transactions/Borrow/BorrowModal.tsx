import { InterestRate, PERMISSION } from '@aave/contract-helpers';
import {
  calculateHealthFactorFromBalancesBigUnits,
  USD_DECIMALS,
  valueToBigNumber,
} from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Checkbox, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useRef, useState } from 'react';
import { Warning } from 'src/components/primitives/Warning';
import {
  ModalWrapper,
  ModalWrapperProps,
} from 'src/components/transactions/FlowCommons/ModalWrapper';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ModalContextType, ModalType, TxStateType, useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import {
  getMaxAmountAvailableToBorrow,
  getMaxGhoMintAmount,
} from 'src/utils/getMaxAmountAvailableToBorrow';
import { isGhoAndSupported } from 'src/utils/ghoUtilities';

import { BasicModal } from '../../primitives/BasicModal';
import { TxSuccessView } from '../FlowCommons/Success';
import { DetailsHFLine } from '../FlowCommons/TxModalDetails';
import { BorrowModalContent } from './BorrowModalContent';
import { GhoBorrowModalContent } from './GhoBorrowModalContent';

export enum ErrorType {
  STABLE_RATE_NOT_ENABLED,
  NOT_ENOUGH_LIQUIDITY,
  BORROWING_NOT_AVAILABLE,
  NOT_ENOUGH_BORROWED,
}

type BorrowModalError = ErrorType | undefined;

type BorrowModalContentContainerProps = ModalWrapperProps & {
  txState: TxStateType;
  unwrapped: boolean;
  setUnwrapped: (unwrapped: boolean) => void;
};

export type BorrowModalContentSharedProps = {
  amount: string;
  onAmountChange: (val: string) => void;
  maxAmountToBorrow: string;
  isMaxSelected: boolean;
  healthFactorComponent: JSX.Element;
  riskCheckboxComponent: JSX.Element;
  displayRiskCheckbox: boolean;
  riskCheckboxAccepted: boolean;
  error: BorrowModalError;
  errorComponent: JSX.Element;
};

/**
 * This container component contains logic, values, and handlers that are shared across both the GHO borrow modal and non-GHO borrow modals. The components are split into separate ones due to a big difference in UI elements, but share common logic.
 * @param {BorrowModalContentContainerProps} props
 * @returns {JSX.Element} - Either the GhoBorrowModalContent or the BorrowModalContent component (non-GHO)
 */
const BorrowModalContentContainer = (props: BorrowModalContentContainerProps): JSX.Element => {
  const { poolReserve, symbol, txState, underlyingAsset, userReserve, unwrapped, setUnwrapped } =
    props;
  const { user, marketReferencePriceInUsd, ghoReserveData } = useAppDataContext();
  const { currentMarket } = useProtocolDataContext();
  const displayGho: boolean = isGhoAndSupported({ symbol, currentMarket });

  // Amount calculations
  const amountRef = useRef<string>('');
  const [_amount, setAmount] = useState('');
  const [interestRateMode, setInterestRateMode] = useState<InterestRate>(InterestRate.Variable);

  let maxAmountToBorrow: BigNumber;
  if (displayGho) {
    const maxAmountUserCanBorrow = getMaxGhoMintAmount(user);
    maxAmountToBorrow = BigNumber.min(
      maxAmountUserCanBorrow,
      valueToBigNumber(ghoReserveData.aaveFacilitatorRemainingCapacity)
    );
  } else {
    maxAmountToBorrow = getMaxAmountAvailableToBorrow(poolReserve, user, interestRateMode);
  }

  const formattedMaxAmountToBorrow = maxAmountToBorrow.toString(10);
  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? formattedMaxAmountToBorrow : _amount;

  const handleAmountChange = (_value: string) => {
    const maxSelected = _value === '-1';
    const value = maxSelected ? formattedMaxAmountToBorrow : _value;
    amountRef.current = value;
    setAmount(value);
  };

  // Health Factor & Risk
  const [riskCheckboxAccepted, setRiskCheckboxAccepted] = useState(false);
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

  const healthFactorComponent: JSX.Element = (
    <DetailsHFLine
      visibleHfChange={!!_amount}
      healthFactor={user.healthFactor}
      futureHealthFactor={newHealthFactor.toString(10)}
    />
  );

  const riskCheckboxComponent: JSX.Element = (
    <>
      <Warning severity="error" sx={{ my: 6 }}>
        <Trans>
          Borrowing this amount will reduce your health factor and increase risk of liquidation.
        </Trans>
      </Warning>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          mx: '24px',
          mb: '12px',
        }}
      >
        <Checkbox
          checked={riskCheckboxAccepted}
          onChange={() => setRiskCheckboxAccepted(!riskCheckboxAccepted)}
          size="small"
          data-cy={'risk-checkbox'}
        />
        <Typography variant="description">
          <Trans>I acknowledge the risks involved.</Trans>
        </Typography>
      </Box>
    </>
  );

  // Error handling
  let error: BorrowModalError;
  if (interestRateMode === InterestRate.Stable && !poolReserve.stableBorrowRateEnabled) {
    error = ErrorType.STABLE_RATE_NOT_ENABLED;
  } else if (
    interestRateMode === InterestRate.Stable &&
    userReserve?.usageAsCollateralEnabledOnUser &&
    valueToBigNumber(amount).lt(userReserve?.underlyingBalance || 0)
  ) {
    error = ErrorType.NOT_ENOUGH_BORROWED;
  } else if (!displayGho && valueToBigNumber(amount).gt(poolReserve.formattedAvailableLiquidity)) {
    // TODO: The `formattedAvailableLiquidity` on the GHO reserve is zero. Look into facilitator cap here to show similar error.
    error = ErrorType.NOT_ENOUGH_LIQUIDITY;
  } else if (!poolReserve.borrowingEnabled) {
    error = ErrorType.BORROWING_NOT_AVAILABLE;
  }

  const displayError = () => {
    switch (error) {
      case ErrorType.BORROWING_NOT_AVAILABLE:
        return <Trans>Borrowing is currently unavailable for {poolReserve.symbol}.</Trans>;
      case ErrorType.NOT_ENOUGH_BORROWED:
        return (
          <Trans>
            You can borrow this asset with a stable rate only if you borrow more than the amount you
            are supplying as collateral.
          </Trans>
        );
      case ErrorType.NOT_ENOUGH_LIQUIDITY:
        return (
          <>
            <Trans>
              There are not enough funds in the
              {poolReserve.symbol}
              reserve to borrow
            </Trans>
          </>
        );
      case ErrorType.STABLE_RATE_NOT_ENABLED:
        return <Trans>The Stable Rate is not enabled for this currency</Trans>;
      default:
        return null;
    }
  };

  const errorComponent: JSX.Element = (
    <Typography variant="helperText" color="error.main">
      {displayError()}
    </Typography>
  );

  const successComponent: JSX.Element = (
    <TxSuccessView
      action={<Trans>Borrowed</Trans>}
      amount={amountRef.current}
      symbol={poolReserve.symbol}
      addToken={{
        address: underlyingAsset,
        symbol: poolReserve.iconSymbol,
        decimals: poolReserve.decimals,
      }}
    />
  );

  const sharedProps: BorrowModalContentSharedProps = {
    amount: _amount,
    onAmountChange: handleAmountChange,
    maxAmountToBorrow: formattedMaxAmountToBorrow,
    isMaxSelected,
    healthFactorComponent,
    riskCheckboxComponent,
    displayRiskCheckbox,
    riskCheckboxAccepted,
    error,
    errorComponent,
  };

  return txState.success ? (
    successComponent
  ) : displayGho ? (
    <GhoBorrowModalContent {...props} {...sharedProps} currentMarket={currentMarket} />
  ) : (
    <BorrowModalContent
      {...props}
      {...sharedProps}
      unwrapped={unwrapped}
      setUnwrapped={setUnwrapped}
      interestRateMode={interestRateMode}
      onInterestRateModeChange={setInterestRateMode}
    />
  );
};

export const BorrowModal = () => {
  const { mainTxState, type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;
  const [unwrapped, setUnwrapped] = useState<boolean>(true);

  return (
    <BasicModal open={type === ModalType.Borrow} setOpen={close}>
      <ModalWrapper
        title={<Trans>Borrow</Trans>}
        underlyingAsset={args.underlyingAsset}
        keepWrappedSymbol={!unwrapped}
        requiredPermission={PERMISSION.BORROWER}
      >
        {(params) => (
          <BorrowModalContentContainer
            {...params}
            txState={mainTxState}
            unwrapped={unwrapped}
            setUnwrapped={setUnwrapped}
          />
        )}
      </ModalWrapper>
    </BasicModal>
  );
};
