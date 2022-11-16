import { InterestRate, valueToWei } from '@aave/contract-helpers';
import {
  calculateHealthFactorFromBalancesBigUnits,
  normalizeBN,
  USD_DECIMALS,
  valueToBigNumber,
} from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Button, Checkbox, Divider, Link, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { Warning } from 'src/components/primitives/Warning';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import usePreviousState from 'src/hooks/usePreviousState';
import { ERC20TokenType } from 'src/libs/web3-data-provider/Web3Provider';
import { useRootStore } from 'src/store/root';
import { getMaxGhoMintAmount } from 'src/utils/getMaxAmountAvailableToBorrow';
import {
  displayDiscountableAmount,
  displayNonDiscountableAmount,
  formatGhoDiscountLockPeriodExpiryDate,
  normalizeBaseVariableBorrowRate,
  weightedAverageAPY,
} from 'src/utils/ghoUtilities';

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
    ghoComputed: { borrowAPRWithMaxDiscount, discountableAmount },
    stakeUserResult,
    ghoDiscountRatePercent,
    ghoDiscountLockPeriod,
    ghoCalculateDiscountRate,
  } = useRootStore();

  // Amount calculations on input changes
  const [_amount, setAmount] = useState('');
  const prevAmount = usePreviousState(_amount);
  const amountRef = useRef<string>();

  // amount calculations
  const maxAmountToBorrow = getMaxGhoMintAmount(user);
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
  const baseBorrowRate = normalizeBaseVariableBorrowRate(poolReserve.baseVariableBorrowRate);

  // Calculate new borrow APY based on borrow amounts
  const [calculatedFutureBorrowAPY, setCalculatedFutureBorrowAPY] = useState<number>(0);
  const [apyDiffers, setApyDiffers] = useState(false);
  const [totalBorrowedGho, setTotalBorrowedGho] = useState<number>(0);

  const currentBorrowAPY = weightedAverageAPY(
    baseBorrowRate,
    Number(userReserve.totalBorrows),
    discountableAmount,
    borrowAPRWithMaxDiscount
  );

  /**
   * Calculates the discount rate based off amount of GHO being borrowed, taking into consideration how much has been borrowed previously as well as discountable and non-discountable amounts.
   * @param borrowingAmountGho - The amount of GHO requested to be borrowed
   */
  const calculateDiscountRate = async (borrowingAmount: string) => {
    if (borrowingAmount === '') {
      // Input is cleared, use initial values
      setCalculatedFutureBorrowAPY(0);
      setApyDiffers(false);
      setTotalBorrowedGho(Number(userReserve.totalBorrows));
    } else {
      // Calculate new rates and check if they differ
      const totalBorrowAmount = valueToWei(
        (Number(userReserve.totalBorrows) + Number(borrowingAmount)).toString(),
        poolReserve.decimals
      );

      const discountRate = await ghoCalculateDiscountRate(totalBorrowAmount, userStakedAaveBalance);
      const newRate = baseBorrowRate * (1 - discountRate);

      setApyDiffers(currentBorrowAPY !== newRate);
      setCalculatedFutureBorrowAPY(newRate);
      setTotalBorrowedGho(normalizeBN(totalBorrowAmount, poolReserve.decimals).toNumber());
    }
  };

  /**
   * Handler for applying the maximum discountable amount to the input.
   * There are some cases when the amount discountable (based off of stkAAVE balance) is larger than the amount able to be borrowed (based off of collateral supplied).
   * In the latter case, we only want to borrow the maximum amount to be borrowed. In the former case, we want to borrow the maximum discountable amount.
   */
  const handleApplyBorrowMaxDiscountable = () => {
    const minimumMaxBorrowableAtADiscount = Math.min(
      discountableAmount,
      Number(maxAmountToBorrow.toString(10))
    );
    setAmount(minimumMaxBorrowableAtADiscount.toString());
  };

  // Calculate the APYs and other information based off of each input change
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
              Safety Module participants (i.e., stkAAVE holders) receive{' '}
              <FormattedNumber
                value={ghoDiscountRatePercent}
                percent
                visibleDecimals={0}
                variant="caption"
              />{' '}
              discount on the GHO borrow interest rate.{' '}
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ mr: 1 }}>
            <Trans>Discount</Trans>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <TokenIcon symbol="GHO" fontSize="small" sx={{ mr: 1 }} />
            <FormattedNumber
              value={discountableAmount}
              visibleDecimals={0}
              compact
              variant="secondary12"
            />
            <Typography variant="secondary12" sx={{ ml: 1 }} component="div">
              <Trans>{`@ ${(
                <FormattedNumber value={borrowAPRWithMaxDiscount} percent variant="secondary12" />
              )} APY`}</Trans>
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handleApplyBorrowMaxDiscountable}
              sx={{ ml: 1, minWidth: 0 }}
            >
              <Trans>Apply</Trans>
            </Button>
          </Box>
        </Box>
      )}

      <TxModalDetails gasLimit={gasLimit}>
        <DetailsHFLine
          visibleHfChange={!!_amount}
          healthFactor={user.healthFactor}
          futureHealthFactor={newHealthFactor.toString(10)}
        />
        {discountAvailable && (
          <>
            <DetailsGhoApyLine
              hasGhoBorrowPositions={hasGhoBorrowPositions}
              inputAmount={amount}
              borrowApy={currentBorrowAPY}
              futureBorrowApy={calculatedFutureBorrowAPY}
              showApyDifference={apyDiffers}
            />
            {(hasGhoBorrowPositions || (!hasGhoBorrowPositions && amount !== '')) && (
              <>
                <Divider sx={{ mb: 7 }}>
                  <Trans>Discount details</Trans>
                </Divider>
                <DiscountDetailsGhoLine
                  title={<Trans>Total borrow balance</Trans>}
                  subtitle={<Trans>After transaction</Trans>}
                  ghoAmount={totalBorrowedGho}
                  ghoAmountUsd={totalBorrowedGho}
                />
                <DiscountDetailsGhoLine
                  title={<Trans>Discountable amount</Trans>}
                  subtitle={
                    <Trans>{`Borrow @ ${(
                      <FormattedNumber
                        value={borrowAPRWithMaxDiscount}
                        percent
                        variant="helperText"
                      />
                    )} APY`}</Trans>
                  }
                  ghoAmount={displayDiscountableAmount(discountableAmount, totalBorrowedGho)}
                />
                <DiscountDetailsGhoLine
                  title={<Trans>Non-discountable amount</Trans>}
                  subtitle={
                    <Trans>{`Borrow @ ${(
                      <FormattedNumber value={baseBorrowRate} percent variant="helperText" />
                    )} APY`}</Trans>
                  }
                  ghoAmount={displayNonDiscountableAmount(discountableAmount, totalBorrowedGho)}
                />
                <DiscountDetailsGhoLine
                  title={<Trans>Discount lock period</Trans>}
                  discountLockPeriod={formatGhoDiscountLockPeriodExpiryDate(
                    new Date(),
                    ghoDiscountLockPeriod
                  )}
                />
              </>
            )}
          </>
        )}
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
