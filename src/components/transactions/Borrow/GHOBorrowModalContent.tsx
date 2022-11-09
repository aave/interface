import { InterestRate } from '@aave/contract-helpers';
import {
  calculateHealthFactorFromBalancesBigUnits,
  normalizeBN,
  USD_DECIMALS,
  valueToBigNumber,
} from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Checkbox, Divider, Link, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { Warning } from 'src/components/primitives/Warning';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import usePreviousState from 'src/hooks/usePreviousState';
import { ERC20TokenType } from 'src/libs/web3-data-provider/Web3Provider';
import { useRootStore } from 'src/store/root';
import { getMaxGHOMintAmount } from 'src/utils/getMaxAmountAvailableToBorrow';
import { formatGhoDiscountLockPeriod } from 'src/utils/ghoUtilities';

import { AssetInput } from '../AssetInput';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import { TxSuccessView } from '../FlowCommons/Success';
import {
  DetailsGhoApyLine,
  DetailsHFLine,
  DiscountDetailsGhoLine,
  TxModalDetails,
} from '../FlowCommons/TxModalDetails';
import { BorrowActions } from './BorrowActions';

export enum ErrorType {
  BORROWING_NOT_AVAILABLE,
}

type GhoBorrowModalContentProps = ModalWrapperProps & { currentMarket: string };

export const GhoBorrowModalContent = ({
  underlyingAsset,
  isWrongNetwork,
  poolReserve,
  symbol,
  currentMarket,
  userReserve,
}: GhoBorrowModalContentProps) => {
  const { mainTxState: borrowTxState, gasLimit, txError } = useModalContext();
  const { user, marketReferencePriceInUsd } = useAppDataContext();
  const {
    stakeUserResult,
    ghoDiscountRatePercent,
    ghoDiscountLockPeriod,
    ghoDiscountedPerToken,
    ghoMinDebtTokenBalanceForEligibleDiscount,
    ghoMinDiscountTokenBalanceForEligibleDiscount,
  } = useRootStore();

  // Amount calculations on input changes
  const [_amount, setAmount] = useState('');
  const prevAmount = usePreviousState(_amount);
  const amountRef = useRef<string>();
  const maxAmountToBorrow = getMaxGHOMintAmount(user);
  const formattedMaxAmountToBorrow = maxAmountToBorrow.toString(10);
  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? maxAmountToBorrow.toString(10) : _amount;
  const amountUsd = valueToBigNumber(amount).multipliedBy(poolReserve.priceInUSD);
  const handleAmountChange = (_value: string) => {
    const maxSelected = _value === '-1';
    const value = maxSelected ? maxAmountToBorrow.toString() : _value;
    amountRef.current = value;
    setAmount(value);
  };

  // Health factor calculations
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

  // token info to add to wallet
  const addToken: ERC20TokenType = {
    address: underlyingAsset,
    symbol: poolReserve.iconSymbol,
    decimals: poolReserve.decimals,
  };

  // Check if user has any open borrow positions on GHO
  // Check if user can borrow at a discount
  const hasGhoBorrowPositions = userReserve.totalBorrows !== '0';
  const userStakedAaveBalance: string = stakeUserResult?.aave.stakeTokenUserBalance ?? '0';
  const discountAvailable = userStakedAaveBalance !== '0';
  // Get contract values
  const baseBorrowRate = normalizeBN(poolReserve.baseVariableBorrowRate, 27).toNumber(); // 0.02 or 2%
  const minStkAave = normalizeBN(
    ghoMinDiscountTokenBalanceForEligibleDiscount.toString(),
    18
  ).toNumber();
  const minGhoBorrowed = normalizeBN(
    ghoMinDebtTokenBalanceForEligibleDiscount.toString(),
    18
  ).toNumber();
  const discountedPerToken = Number(ghoDiscountedPerToken);

  // Calculate new borrow APY based on borrow amounts
  const [calculatedBorrowAPY, setCalculatedBorrowAPY] = useState<number>(0);
  const [calculatedFutureBorrowAPY, setCalculatedFutureBorrowAPY] = useState<number>(0);
  const [apyDiffers, setApyDiffers] = useState(false);
  const [discountableGhoAmount, setDiscountableGhoAmount] = useState<number>(0);
  const [totalBorrowedGho, setTotalBorrowedGho] = useState<number>(0);
  /**
   * This function recreates the logic that happens in GhoDiscountRateStrategy.sol to determine a user's discount rate for borrowing GHO based off of the amount of stkAAVE a user holds.
   * This is repeated here so that we don't bombard the RPC with HTTP requests to do this calculation and read from on-chain logic.
   * NOTE: if the discount rate strategy changes on-chain, then this creates a maintenance issue and we'll have to update this.
   * @param stakedAave - The hypothectical amount of stkAAVE
   * @param borrowedGho - The hypothetical amount of GHO
   */
  const calculateDiscountRate = async (borrowingAmount: string) => {
    let newRate: number;
    let borrowedGho: number;
    const stakedAave = Number(userStakedAaveBalance);

    // Calculate helper
    const calculationHelper = (borrowableAmount: number): number => {
      if (stakedAave < minStkAave || borrowableAmount < minGhoBorrowed) {
        newRate = 0;
      } else {
        const discountableAmount = stakedAave * discountedPerToken;
        if (discountableAmount >= borrowableAmount) {
          newRate = ghoDiscountRatePercent;
        } else {
          newRate = (discountableAmount * ghoDiscountRatePercent) / borrowableAmount;
        }
        const normalizedDiscountable = normalizeBN(discountableAmount.toString(), 18).toNumber();
        setDiscountableGhoAmount(normalizedDiscountable);
      }

      // Calculate the new borrow APY - Takes the total discount as a fraction of the existing borrow rate
      return baseBorrowRate - baseBorrowRate * newRate;
    };

    // Input is cleared, use initial values
    if (borrowingAmount === '') {
      borrowedGho = Number(userReserve.totalBorrows);
      const newRate = calculationHelper(borrowedGho);
      setCalculatedBorrowAPY(newRate);
      setCalculatedFutureBorrowAPY(0);
      setApyDiffers(false);
    } else {
      // Calculate new rates and check if they differ
      borrowedGho = Number(userReserve.totalBorrows) + Number(borrowingAmount);
      const oldRate = calculationHelper(Number(userReserve.totalBorrows));
      const newRate = calculationHelper(borrowedGho);
      if (oldRate !== newRate) {
        setApyDiffers(true);
      }
      setCalculatedBorrowAPY(oldRate);
      setCalculatedFutureBorrowAPY(newRate);
    }
    setTotalBorrowedGho(borrowedGho);
  };

  useEffect(() => {
    if (prevAmount !== _amount) {
      calculateDiscountRate(_amount);
    }
  }, [_amount]);

  if (borrowTxState.success)
    return (
      <TxSuccessView
        action={<Trans>Borrowed</Trans>}
        amount={amountRef.current}
        symbol={poolReserve.symbol}
        addToken={addToken}
      />
    );

  return (
    <>
      {!discountAvailable && !hasGhoBorrowPositions && (
        <Warning severity="info" sx={{ mb: 6 }}>
          <Typography variant="subheader1" gutterBottom>
            <Trans>GHO discount program</Trans>
          </Typography>
          <Typography variant="caption">
            <Trans>
              Safety Module participants (i.e., stkAAVE holders) receive 20% discount on the GHO
              borrow interest rate.{' '}
              <Link
                href={`/reserve-overview/?underlyingAsset=${underlyingAsset}&marketName=${currentMarket}`}
                underline="always"
              >
                Learn details
              </Link>
            </Trans>
          </Typography>
        </Warning>
      )}

      <AssetInput
        value={amount}
        onChange={handleAmountChange}
        usdValue={amountUsd.toString(10)}
        assets={[
          {
            balance: formattedMaxAmountToBorrow,
            symbol: symbol,
            iconSymbol: poolReserve.iconSymbol,
          },
        ]}
        symbol="GHO"
        isMaxSelected={isMaxSelected}
        maxValue={maxAmountToBorrow.toString(10)}
      />

      {discountAvailable && !hasGhoBorrowPositions && (
        <Box>
          <Typography>
            Discount <TokenIcon symbol="GHO" fontSize="small" />
          </Typography>
        </Box>
      )}

      <TxModalDetails gasLimit={gasLimit}>
        <DetailsHFLine
          visibleHfChange={!!_amount}
          healthFactor={user.healthFactor}
          futureHealthFactor={newHealthFactor.toString(10)}
        />
        {discountAvailable && (
          <DetailsGhoApyLine
            hasGhoBorrowPositions={hasGhoBorrowPositions}
            borrowApy={calculatedBorrowAPY}
            futureBorrowApy={calculatedFutureBorrowAPY}
            showApyDifference={apyDiffers}
          />
        )}
        {/* TODO: show amounts for total borrowed and how much is being discountable */}
        <Divider sx={{ mb: 7 }}>Discount details</Divider>
        <DiscountDetailsGhoLine
          title={<Trans>Total borrow balance</Trans>}
          subtitle={<Trans>After transaction</Trans>}
          ghoAmount={totalBorrowedGho}
          ghoAmountUsd={totalBorrowedGho}
        />
        <DiscountDetailsGhoLine
          title={<Trans>Discountable amount</Trans>}
          subtitle={<Trans>Borrow @ 1.60% APY</Trans>}
          ghoAmount={
            discountableGhoAmount >= totalBorrowedGho ? totalBorrowedGho : discountableGhoAmount
          }
          tooltipText={<Trans>This is tooltip text</Trans>}
        />
        <DiscountDetailsGhoLine
          title={<Trans>Non-discountable amount</Trans>}
          subtitle={<Trans>Borrow @ 2.00% APY</Trans>}
          ghoAmount={
            discountableGhoAmount >= totalBorrowedGho ? 0 : totalBorrowedGho - discountableGhoAmount
          }
          tooltipText={<Trans>This is tooltip text</Trans>}
        />
        <DiscountDetailsGhoLine
          title={<Trans>Discount lock period</Trans>}
          tooltipText={<Trans>This is tooltip text</Trans>}
          discountLockPeriod={formatGhoDiscountLockPeriod(ghoDiscountLockPeriod)}
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      {displayRiskCheckbox && (
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
      )}

      <BorrowActions
        poolReserve={poolReserve}
        amountToBorrow={amount}
        poolAddress={poolReserve.underlyingAsset}
        interestRateMode={InterestRate.Variable}
        isWrongNetwork={isWrongNetwork}
        symbol={symbol}
        blocked={displayRiskCheckbox && !riskCheckboxAccepted}
        sx={displayRiskCheckbox ? { mt: 0 } : {}}
      />
    </>
  );
};
