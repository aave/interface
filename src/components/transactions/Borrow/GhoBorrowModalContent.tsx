import { InterestRate, valueToWei } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { ArrowNarrowRightIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Link, SvgIcon, Typography } from '@mui/material';
import PercentIcon from 'public/icons/markets/percent-icon.svg';
import { useEffect, useState } from 'react';
import { GhoIncentivesCard } from 'src/components/incentives/GhoIncentivesCard';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { ROUTES } from 'src/components/primitives/Link';
import { NoData } from 'src/components/primitives/NoData';
import { Row } from 'src/components/primitives/Row';
import { Warning } from 'src/components/primitives/Warning';
import { useModalContext } from 'src/hooks/useModal';
import usePreviousState from 'src/hooks/usePreviousState';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';
import { weightedAverageAPY } from 'src/utils/ghoUtilities';

import { AssetInput } from '../AssetInput';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
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
  const { currentMarket: customMarket } = useProtocolDataContext();
  const {
    ghoLoadingData,
    ghoLoadingMarketData,
    ghoComputed: { borrowAPYWithMaxDiscount, discountableAmount },
    stakeUserResult,
    ghoDiscountRatePercent,
    ghoCalculateDiscountRate,
    ghoBorrowAPY,
    stkAaveBalance,
  } = useRootStore();
  const loading = ghoLoadingData || ghoLoadingMarketData;

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
  const showNoAPYData = !hasGhoBorrowPositions && amount === '';
  const showBorrowAPY = hasGhoBorrowPositions || (!hasGhoBorrowPositions && amount !== '');

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
        balanceText={<Trans>Available</Trans>}
      />
      {error !== undefined && errorComponent}
      {/* {discountAvailable && !hasGhoBorrowPositions && <ApplyBorrowForMaxDiscount /> */}
      <TxModalDetails gasLimit={gasLimit}>
        {healthFactorComponent}
        <Row
          caption={
            <Box>
              <Typography>
                <Trans>Borrow APY</Trans>
              </Typography>
            </Box>
          }
          captionVariant="description"
          mb={4}
          align="flex-start"
        >
          <Box sx={{ textAlign: 'right' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              {showNoAPYData && <NoData variant="secondary14" color="text.muted" />}
              {showBorrowAPY && (
                <>
                  {hasGhoBorrowPositions && (
                    <GhoIncentivesCard
                      value={loading ? -1 : currentBorrowAPY}
                      incentives={userReserve.reserve.vIncentivesData}
                      symbol={userReserve.reserve.symbol}
                      data-cy={`apyType`}
                      tooltip={apyDiffers ? undefined : <PercentIcon />}
                      borrowAmount={
                        apyDiffers
                          ? userReserve.totalBorrows
                          : amount !== ''
                          ? (Number(amount) + Number(userReserve.totalBorrows)).toString()
                          : userReserve.totalBorrows
                      }
                      baseApy={ghoBorrowAPY}
                      discountPercent={ghoDiscountRatePercent * -1}
                      discountableAmount={discountableAmount}
                      stkAaveBalance={stkAaveBalance || 0}
                      ghoRoute={
                        ROUTES.reserveOverview(userReserve.reserve.underlyingAsset, customMarket) +
                        '/#discount'
                      }
                    />
                  )}
                  {apyDiffers && (
                    <>
                      {hasGhoBorrowPositions && (
                        <SvgIcon color="primary" sx={{ fontSize: '14px', mx: 1 }}>
                          <ArrowNarrowRightIcon />
                        </SvgIcon>
                      )}
                      <GhoIncentivesCard
                        value={loading ? -1 : calculatedFutureBorrowAPY}
                        incentives={userReserve.reserve.vIncentivesData}
                        symbol={userReserve.reserve.symbol}
                        data-cy={`apyType`}
                        tooltip={<PercentIcon />}
                        borrowAmount={Number(userReserve.totalBorrows) + Number(amount)}
                        baseApy={ghoBorrowAPY}
                        discountPercent={ghoDiscountRatePercent * -1}
                        discountableAmount={discountableAmount}
                        stkAaveBalance={stkAaveBalance || 0}
                        ghoRoute={
                          ROUTES.reserveOverview(
                            userReserve.reserve.underlyingAsset,
                            customMarket
                          ) + '/#discount'
                        }
                      />
                    </>
                  )}
                </>
              )}
            </Box>
          </Box>
        </Row>
        {/* {discountAvailable && <DiscountAvailableLineItem /> */}
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

// TODO: These GHO line item components are currently not used but have been used in previous iterations
// This is mainly kept around in case they need to be reimplemented. This dead code should be ripped out if it's deemed it won't be used in future iterations, at which point we can use Git history if need be if they ever do.

// type DiscountDetailsGhoLineProps = {
//   title: ReactNode;
//   subtitle?: ReactNode;
//   ghoAmount: number;
//   ghoAmountUsd?: number;
// };

// export const DiscountDetailsGhoLine: React.FC<DiscountDetailsGhoLineProps> = ({
//   title,
//   subtitle,
//   ghoAmount,
//   ghoAmountUsd,
// }) => (
//   <Row
//     caption={
//       <Box>
//         <Typography>{title}</Typography>
//         {subtitle && (
//           <Typography variant="helperText" color="text.secondary">
//             {subtitle}
//           </Typography>
//         )}
//       </Box>
//     }
//     captionVariant="description"
//     mb={4}
//     align="flex-start"
//   >
//     <Box sx={{ textAlign: 'right' }}>
//       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
//         <TokenIcon symbol="GHO" fontSize="small" sx={{ mr: 1 }} />{' '}
//         <FormattedNumber value={ghoAmount} visibleDecimals={2} />
//       </Box>
//       {ghoAmountUsd && (
//         <FormattedNumber
//           value={ghoAmountUsd}
//           symbol="USD"
//           visibleDecimals={2}
//           variant="helperText"
//           color="text.secondary"
//           compact
//         />
//       )}
//     </Box>
//   </Row>
// );

// const DiscountAvailableLineItem: React.FC = () => {
//   return (
//     <>
//       <DetailsGhoApyLine
//         hasGhoBorrowPositions={hasGhoBorrowPositions}
//         inputAmount={amount}
//         borrowApy={currentBorrowAPY}
//         futureBorrowApy={calculatedFutureBorrowAPY}
//         showApyDifference={apyDiffers}
//       />
//       {(hasGhoBorrowPositions || (!hasGhoBorrowPositions && amount !== '')) && (
//         <>
//           <Divider sx={{ mb: 7 }}>
//             <Trans>Discount details</Trans>
//           </Divider>
//           <DiscountDetailsGhoLine
//             title={<Trans>Total borrow balance</Trans>}
//             subtitle={<Trans>After transaction</Trans>}
//             ghoAmount={totalBorrowedGho}
//             ghoAmountUsd={totalBorrowedGho}
//           />
//           <DiscountDetailsGhoLine
//             title={<Trans>Discountable amount</Trans>}
//             subtitle={
//               <Trans>{`Borrow @ ${(
//                 <FormattedNumber value={borrowAPYWithMaxDiscount} percent variant="helperText" />
//               )} APY`}</Trans>
//             }
//             ghoAmount={displayDiscountableAmount(discountableAmount, totalBorrowedGho)}
//           />
//           <DiscountDetailsGhoLine
//             title={<Trans>Non-discountable amount</Trans>}
//             subtitle={
//               <Trans>{`Borrow @ ${(
//                 <FormattedNumber value={baseBorrowRate} percent variant="helperText" />
//               )} APY`}</Trans>
//             }
//             ghoAmount={displayNonDiscountableAmount(discountableAmount, totalBorrowedGho)}
//           />
//         </>
//       )}
//     </>
//   );
// };

// const ApplyBorrowForMaxDiscount: React.FC = () => {
//   /**
//    * Handler for applying the maximum discountable amount to the input.
//    * There are some cases when the amount discountable (based off of stkAAVE balance) is larger than the amount able to be borrowed (based off of collateral supplied).
//    * In the latter case, we only want to borrow the maximum amount to be borrowed. In the former case, we want to borrow the maximum discountable amount.
//    */
//   const handleApplyBorrowMaxDiscountable = () => {
//     const minimumMaxBorrowableAtADiscount = Math.min(discountableAmount, Number(maxAmountToBorrow));
//     onAmountChange(minimumMaxBorrowableAtADiscount.toString());
//   };

//   return (
//     <Box sx={{ display: 'flex', alignItems: 'center' }}>
//       <Typography sx={{ mr: 1 }}>
//         <Trans>Discount</Trans>
//       </Typography>
//       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
//         <TokenIcon symbol="GHO" fontSize="small" sx={{ mr: 1 }} />
//         <FormattedNumber
//           value={discountableAmount}
//           visibleDecimals={0}
//           compact
//           variant="secondary12"
//         />
//         <Typography variant="secondary12" sx={{ ml: 1 }} component="div">
//           <Trans>{`@ ${(
//             <FormattedNumber value={borrowAPYWithMaxDiscount} percent variant="secondary12" />
//           )} APY`}</Trans>
//         </Typography>
//         <Button
//           variant="outlined"
//           size="small"
//           onClick={handleApplyBorrowMaxDiscountable}
//           sx={{ ml: 1, minWidth: 0 }}
//         >
//           <Trans>Apply</Trans>
//         </Button>
//       </Box>
//     </Box>
//   );
// };
