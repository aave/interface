import { InterestRate, valueToWei } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Link, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
// import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { Warning } from 'src/components/primitives/Warning';
import { useModalContext } from 'src/hooks/useModal';
import usePreviousState from 'src/hooks/usePreviousState';
import { useRootStore } from 'src/store/root';
import { weightedAverageAPY } from 'src/utils/ghoUtilities';

import { AssetInput } from '../AssetInput';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import { DetailsGhoApyLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
import { BorrowActions } from './BorrowActions';
import { BorrowModalContentSharedProps } from './BorrowModal';

type GhoBorrowModalContentProps = ModalWrapperProps &
  BorrowModalContentSharedProps & {
    currentMarket: string;
  };

export const GhoBorrowModalContent = ({
  underlyingAsset,
  isWrongNetwork,
  poolReserve,
  symbol,
  currentMarket,
  userReserve,
  amount,
  onAmountChange,
  maxAmountToBorrow,
  isMaxSelected,
  healthFactorComponent,
  riskCheckboxComponent,
  displayRiskCheckbox,
  riskCheckboxAccepted,
  error,
  errorComponent,
}: GhoBorrowModalContentProps) => {
  const { gasLimit, txError } = useModalContext();
  const {
    ghoComputed: { borrowAPYWithMaxDiscount, discountableAmount },
    stakeUserResult,
    ghoDiscountRatePercent,
    ghoCalculateDiscountRate,
    ghoBorrowAPY,
  } = useRootStore();

  // Check if user has any open borrow positions on GHO
  // Check if user can borrow at a discount
  const hasGhoBorrowPositions = userReserve.totalBorrows !== '0';
  const userStakedAaveBalance: string = stakeUserResult?.aave.stakeTokenUserBalance ?? '0';
  const discountAvailable = userStakedAaveBalance !== '0';

  // Calculate new borrow APY based on borrow amounts
  const prevAmount = usePreviousState(amount);
  const [calculatedFutureBorrowAPY, setCalculatedFutureBorrowAPY] = useState<number>(0);
  const [apyDiffers, setApyDiffers] = useState(false);
  // const [totalBorrowedGho, setTotalBorrowedGho] = useState<number>(0);

  const currentBorrowAPY = weightedAverageAPY(
    ghoBorrowAPY,
    Number(userReserve.totalBorrows),
    discountableAmount,
    borrowAPYWithMaxDiscount
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
      // setTotalBorrowedGho(Number(userReserve.totalBorrows));
    } else {
      // Calculate new rates and check if they differ
      const totalBorrowAmount = valueToWei(
        (Number(userReserve.totalBorrows) + Number(borrowingAmount)).toString(),
        poolReserve.decimals
      );

      const discountRate = await ghoCalculateDiscountRate(totalBorrowAmount, userStakedAaveBalance);
      const newRate = ghoBorrowAPY * (1 - discountRate);

      setApyDiffers(currentBorrowAPY !== newRate);
      setCalculatedFutureBorrowAPY(newRate);
      // setTotalBorrowedGho(Number(formatUnits(totalBorrowAmount, poolReserve.decimals)));
    }
  };

  /**
   * Handler for applying the maximum discountable amount to the input.
   * There are some cases when the amount discountable (based off of stkAAVE balance) is larger than the amount able to be borrowed (based off of collateral supplied).
   * In the latter case, we only want to borrow the maximum amount to be borrowed. In the former case, we want to borrow the maximum discountable amount.
   */
  // const handleApplyBorrowMaxDiscountable = () => {
  //   const minimumMaxBorrowableAtADiscount = Math.min(discountableAmount, Number(maxAmountToBorrow));
  //   onAmountChange(minimumMaxBorrowableAtADiscount.toString());
  // };

  // Calculate the APYs and other information based off of each input change
  useEffect(() => {
    if (prevAmount !== amount) {
      calculateDiscountRate(amount);
    }
  }, [amount]);

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
        onChange={onAmountChange}
        usdValue={valueToBigNumber(amount).multipliedBy(poolReserve.priceInUSD).toString(10)}
        assets={[
          {
            balance: maxAmountToBorrow,
            symbol: symbol,
            iconSymbol: poolReserve.iconSymbol,
          },
        ]}
        symbol="GHO"
        isMaxSelected={isMaxSelected}
        maxValue={maxAmountToBorrow}
      />
      {error !== undefined && errorComponent}
      {/* {discountAvailable && !hasGhoBorrowPositions && (
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
                <FormattedNumber value={borrowAPYWithMaxDiscount} percent variant="secondary12" />
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
      )} */}
      <TxModalDetails gasLimit={gasLimit}>
        {healthFactorComponent}
        <DetailsGhoApyLine
          hasGhoBorrowPositions={hasGhoBorrowPositions}
          inputAmount={amount}
          borrowApy={currentBorrowAPY}
          futureBorrowApy={calculatedFutureBorrowAPY}
          showApyDifference={apyDiffers}
        />
        {/* {discountAvailable && (
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
                        value={borrowAPYWithMaxDiscount}
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
              </>
            )}
          </>
        )} */}
      </TxModalDetails>
      {txError && <GasEstimationError txError={txError} />}
      {displayRiskCheckbox && riskCheckboxComponent}
      <BorrowActions
        poolReserve={poolReserve}
        amountToBorrow={amount}
        poolAddress={poolReserve.underlyingAsset}
        interestRateMode={InterestRate.Variable}
        isWrongNetwork={isWrongNetwork}
        symbol={symbol}
        blocked={error !== undefined || (displayRiskCheckbox && !riskCheckboxAccepted)}
        sx={displayRiskCheckbox ? { mt: 0 } : {}}
      />
    </>
  );
};
