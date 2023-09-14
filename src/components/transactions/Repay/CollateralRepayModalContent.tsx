import {
  API_ETH_MOCK_ADDRESS,
  InterestRate,
  synthetixProxyByChainId,
} from '@aave/contract-helpers';
import {
  BigNumberValue,
  calculateHealthFactorFromBalancesBigUnits,
  valueToBigNumber,
} from '@aave/math-utils';
import { ArrowDownIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { useRef, useState } from 'react';
import { PriceImpactTooltip } from 'src/components/infoTooltips/PriceImpactTooltip';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { SwapVariant } from 'src/hooks/paraswap/common';
import { useCollateralRepaySwap } from 'src/hooks/paraswap/useCollateralRepaySwap';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ListSlippageButton } from 'src/modules/dashboard/lists/SlippageList';
import { useRootStore } from 'src/store/root';
import { calculateHFAfterRepay } from 'src/utils/hfUtils';

import { Asset, AssetInput } from '../AssetInput';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import { TxSuccessView } from '../FlowCommons/Success';
import {
  DetailsHFLine,
  DetailsNumberLineWithSub,
  TxModalDetails,
} from '../FlowCommons/TxModalDetails';
import { ErrorType, useFlashloan, zeroLTVBlockingWithdraw } from '../utils';
import { ParaswapErrorDisplay } from '../Warnings/ParaswapErrorDisplay';
import { CollateralRepayActions } from './CollateralRepayActions';
import { RepayActions } from './RepayActions';

interface RepayAsset extends Asset {
  balance: string;
  balanceUSD: string;
}

export function CollateralRepayModalContent({
  poolReserve,
  symbol,
  debtType,
  userReserve,
  tokenBalance,
  isWrongNetwork,
}: ModalWrapperProps & { debtType: InterestRate }) {
  const { user, reserves, userReserves } = useAppDataContext();
  const { gasLimit, txError, mainTxState } = useModalContext();
  const { currentChainId, currentNetworkConfig, currentMarketData, currentMarket } =
    useProtocolDataContext();
  const { currentAccount } = useWeb3Context();
  const [displayGho] = useRootStore((store) => [store.displayGho]);
  const [repayMaxAToken, setRepayMaxAToken] = useState('');
  const { underlyingBalance, usageAsCollateralEnabledOnUser, reserve } = userReserve;

  const [swapVariant, setSwapVariant] = useState<SwapVariant>('exactOut');
  const [amount, setAmount] = useState('');
  const [maxSlippage, setMaxSlippage] = useState('0.5');

  const amountRef = useRef<string>('');
  // const repayTokens: RepayAsset[] = [];
  // List of tokens eligble to repay with, ordered by USD value
  const repayTokens: RepayAsset[] = user.userReservesData
    .filter(
      (userReserve) =>
        userReserve.underlyingBalance !== '0' &&
        userReserve.underlyingAsset !== poolReserve.underlyingAsset &&
        userReserve.reserve.symbol !== 'stETH'
    )
    .map((userReserve) => ({
      address: userReserve.underlyingAsset,
      balance: userReserve.underlyingBalance,
      balanceUSD: userReserve.underlyingBalanceUSD,
      symbol: userReserve.reserve.symbol,
      iconSymbol: userReserve.reserve.iconSymbol,
    }))
    .sort((a, b) => Number(b.balanceUSD) - Number(a.balanceUSD));

  const assets = [
    {
      address: poolReserve.underlyingAsset,
      symbol: poolReserve.symbol,
      iconSymbol: poolReserve.iconSymbol,
      balance: tokenBalance,
    },
  ];

  const [tokenToRepayWith, setTokenToRepayWith] = useState<RepayAsset>(repayTokens[0]);
  const tokenToRepayWithBalance = tokenToRepayWith.balance || '0';
  const repayWithATokens = tokenToRepayWith.address === poolReserve.aTokenAddress;

  const collateralReserveData = reserves.find(
    (reserve) => reserve.underlyingAsset === tokenToRepayWith.address
  ) as ComputedReserveData;

  const debt =
    debtType === InterestRate.Stable
      ? userReserve?.stableBorrows || '0'
      : userReserve?.variableBorrows || '0';
  const safeAmountToRepayAll = valueToBigNumber(debt).multipliedBy('1.0025');

  if (currentMarketData.v3 && !displayGho({ symbol: poolReserve.symbol, currentMarket })) {
    const aTokenBalance = valueToBigNumber(underlyingBalance);
    const maxBalance = BigNumber.max(
      aTokenBalance,
      BigNumber.min(aTokenBalance, debt).toString(10)
    );
    repayTokens.push({
      address: poolReserve.aTokenAddress,
      symbol: `a${poolReserve.symbol}`,
      iconSymbol: poolReserve.iconSymbol,
      balance: maxBalance.toString(10),
      balanceUSD: maxBalance.toString(10),
    });
  }

  const isMaxSelected = amount === '-1';
  const repayAmount = isMaxSelected ? safeAmountToRepayAll.toString() : amount;
  const repayAmountUsdValue = valueToBigNumber(repayAmount)
    .multipliedBy(poolReserve.priceInUSD)
    .toString();

  // The slippage is factored into the collateral amount because when we swap for 'exactOut', positive slippage is applied on the collateral amount.
  const collateralAmountRequiredToCoverDebt = safeAmountToRepayAll
    .multipliedBy(poolReserve.priceInUSD)
    .multipliedBy(100 + Number(maxSlippage))
    .dividedBy(100)
    .dividedBy(
      collateralReserveData && collateralReserveData.priceInUSD
        ? collateralReserveData.priceInUSD
        : poolReserve.priceInUSD
    );

  const swapIn = { ...collateralReserveData, amount: tokenToRepayWithBalance };
  const swapOut = { ...poolReserve, amount: amountRef.current };
  if (swapVariant === 'exactIn') {
    swapIn.amount = tokenToRepayWithBalance;
    swapOut.amount = '0';
  }

  const repayAllDebt =
    isMaxSelected &&
    valueToBigNumber(tokenToRepayWithBalance).gte(collateralAmountRequiredToCoverDebt);

  const {
    inputAmountUSD,
    inputAmount,
    outputAmount,
    outputAmountUSD,
    loading: routeLoading,
    error,
    buildTxFn,
  } = useCollateralRepaySwap({
    chainId: currentNetworkConfig.underlyingChainId || currentChainId,
    userAddress: currentAccount,
    swapVariant: swapVariant,
    swapIn,
    swapOut,
    max: repayAllDebt,
    skip: mainTxState.loading || false,
    maxSlippage: Number(maxSlippage),
  });

  const loadingSkeleton = routeLoading && inputAmountUSD === '0';

  // WORKING
  const handleRepayAmountChange = (value: string) => {
    const maxSelected = value === '-1';
    if (
      maxSelected &&
      valueToBigNumber(tokenToRepayWithBalance).lt(collateralAmountRequiredToCoverDebt)
    ) {
      if (repayWithATokens) {
        const maxAmountRepayATokens = BigNumber.min(underlyingBalance, debt).toString(10);
        amountRef.current = maxAmountRepayATokens;
        setAmount(value);
        setRepayMaxAToken(maxAmountRepayATokens);
      } else {
        // The selected collateral amount is not enough to pay the full debt. We'll try to do a swap using the exact amount of collateral.
        // The amount won't be known until we fetch the swap data, so we'll clear it out. Once the swap data is fetched, we'll set the amount.
        amountRef.current = '';
        setAmount('');
      }
      setSwapVariant('exactIn');
    } else {
      if (repayWithATokens) {
        setAmount(value);
        setSwapVariant('exactOut');
      } else {
        amountRef.current = maxSelected ? safeAmountToRepayAll.toString(10) : value;
        setAmount(value);
        setSwapVariant('exactOut');
      }
    }
  };

  // const handleRepayAmountChange = (value: string) => {
  //   const maxSelected = value === '-1';
  //   console.log('maxSelected', value, maxSelected);
  //   if (
  //     maxSelected &&
  //     valueToBigNumber(tokenToRepayWithBalance).lt(collateralAmountRequiredToCoverDebt)
  //   ) {
  //     if (repayWithATokens) {
  //       const maxAmountRepayATokens = BigNumber.min(underlyingBalance, debt).toString(10);
  //       amountRef.current = maxAmountRepayATokens;
  //       setAmount(value);
  //       setRepayMaxAToken(maxAmountRepayATokens);
  //     } else {
  //       // The selected collateral amount is not enough to pay the full debt.
  //       // We'll try to do a swap using the exact amount of collateral.
  //       // The amount won't be known until we fetch the swap data,
  //       // so we'll clear it out. Once the swap data is fetched, we'll set the amount.
  //       amountRef.current = '';
  //       setAmount('');

  //       // Adding the provided code snippet here.
  //       if (maxSelected && repayWithATokens) {
  //         if (
  //           tokenToRepayWith.address === API_ETH_MOCK_ADDRESS.toLowerCase() ||
  //           (synthetixProxyByChainId[currentChainId] &&
  //             synthetixProxyByChainId[currentChainId].toLowerCase() ===
  //               reserve.underlyingAsset.toLowerCase())
  //         ) {
  //           // for native token and synthetix (only mainnet) we can't send -1 as
  //           // contract does not accept max unit256
  //           setRepayMaxAToken(safeAmountToRepayAll.toString(10));
  //         } else {
  //           // -1 can always be used for v3 otherwise
  //           // for v2 we can only use -1 when the user has more balance than max debt to repay
  //           // this is accounted for when maxAmountToRepay.eq(debt) as maxAmountToRepay is
  //           // min between debt and wallet balance, so if it enters here for v2 it means
  //           // balance is bigger and will be able to transact with -1
  //           setRepayMaxAToken('-1');
  //         }
  //       }
  //     }
  //     setSwapVariant('exactIn');
  //   } else {
  //     console.log('food');
  //     amountRef.current = maxSelected ? safeAmountToRepayAll.toString(10) : value;
  //     setAmount(value);
  //     setSwapVariant('exactOut');
  //   }
  // };

  // health factor calculations for aToken repayments
  // we use usd values instead of MarketreferenceCurrency so it has same precision
  let newHFWithATokens = user?.healthFactor;
  if (amount && repayWithATokens) {
    let collateralBalanceMarketReferenceCurrency: BigNumberValue = user?.totalCollateralUSD || '0';
    if (repayWithATokens && usageAsCollateralEnabledOnUser) {
      collateralBalanceMarketReferenceCurrency = valueToBigNumber(
        user?.totalCollateralUSD || '0'
      ).minus(valueToBigNumber(reserve.priceInUSD).multipliedBy(amount));
    }

    const remainingBorrowBalance = valueToBigNumber(user?.totalBorrowsUSD || '0').minus(
      valueToBigNumber(reserve.priceInUSD).multipliedBy(amount)
    );
    const borrowBalanceMarketReferenceCurrency = BigNumber.max(remainingBorrowBalance, 0);

    const calculatedHealthFactor = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency,
      borrowBalanceMarketReferenceCurrency,
      currentLiquidationThreshold: user?.currentLiquidationThreshold || '0',
    });

    newHFWithATokens =
      calculatedHealthFactor.isLessThan(0) && !calculatedHealthFactor.eq(-1)
        ? '0'
        : calculatedHealthFactor.toString(10);
  }

  const repayWithUserReserve = userReserves.find(
    (userReserve) => userReserve.underlyingAsset === tokenToRepayWith.address
  );
  // for v3 we need hf after withdraw collateral, because when removing collateral to repay
  // debt, hf could go under 1 then it would fail. If that is the case then we need
  // to use flashloan path
  const { hfAfterSwap, hfEffectOfFromAmount } = calculateHFAfterRepay({
    amountToReceiveAfterSwap: outputAmount,
    amountToSwap: inputAmount,
    // Since its the aToken reserve already we can use the poolReserve
    fromAssetData: repayWithATokens ? poolReserve : collateralReserveData,
    user,
    toAssetData: poolReserve,
    repayWithUserReserve,
    debt,
  });
  // If the selected collateral asset is frozen, a flashloan must be used. When a flashloan isn't used,
  // the remaining amount after the swap is deposited into the pool, which will fail for frozen assets.
  const shouldUseFlashloan =
    useFlashloan(user.healthFactor, hfEffectOfFromAmount.toString()) ||
    collateralReserveData?.isFrozen;
  const maxAmountRepayATokens = BigNumber.min(underlyingBalance, debt).toString(10);

  // we need to get the min as minimumReceived can be greater than debt as we are swapping
  // a safe amount to repay all. When this happens amountAfterRepay would be < 0 and
  // this would show as certain amount left to repay when we are actually repaying all debt
  let amountAfterRepay;
  if (!repayWithATokens) {
    amountAfterRepay = valueToBigNumber(debt).minus(BigNumber.min(outputAmount, debt));
  } else {
    amountAfterRepay = valueToBigNumber(debt).minus(
      isMaxSelected ? maxAmountRepayATokens : amount || '0'
    );
  }

  const displayAmountAfterRepayInUsd = amountAfterRepay.multipliedBy(poolReserve.priceInUSD);
  const collateralAmountAfterRepay = tokenToRepayWithBalance
    ? valueToBigNumber(tokenToRepayWithBalance).minus(inputAmount)
    : valueToBigNumber('0');
  const collateralAmountAfterRepayUSD = collateralAmountAfterRepay.multipliedBy(
    collateralReserveData && collateralReserveData.priceInUSD
      ? collateralReserveData.priceInUSD
      : poolReserve.priceInUSD
  );
  const exactOutputAmount = swapVariant === 'exactIn' ? outputAmount : repayAmount;
  const exactOutputUsd = swapVariant === 'exactIn' ? outputAmountUSD : repayAmountUsdValue;

  const amountRepaid =
    isMaxSelected && repayWithATokens ? maxAmountRepayATokens : exactOutputAmount;
  const assetsBlockingWithdraw: string[] = zeroLTVBlockingWithdraw(user);
  const aTokenBalanceAfterRepayment = valueToBigNumber(underlyingBalance).minus(repayAmount);

  let blockingError: ErrorType | undefined = undefined;

  if (
    assetsBlockingWithdraw.length > 0 &&
    !assetsBlockingWithdraw.includes(tokenToRepayWith.symbol)
  ) {
    blockingError = ErrorType.ZERO_LTV_WITHDRAW_BLOCKED;
  } else if (valueToBigNumber(tokenToRepayWithBalance).lt(inputAmount)) {
    blockingError = ErrorType.NOT_ENOUGH_COLLATERAL_TO_REPAY_WITH;
  }

  const BlockingError: React.FC = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_COLLATERAL_TO_REPAY_WITH:
        return <Trans>Not enough collateral to repay this amount of debt with</Trans>;
      case ErrorType.ZERO_LTV_WITHDRAW_BLOCKED:
        return (
          <Trans>
            Assets with zero LTV ({assetsBlockingWithdraw}) must be withdrawn or disabled as
            collateral to perform this action
          </Trans>
        );
      default:
        return null;
    }
  };

  if (mainTxState.success)
    return (
      <TxSuccessView
        action={<Trans>Repaid</Trans>}
        amount={outputAmount}
        symbol={poolReserve.symbol}
      />
    );
  console.log('swapVariant ---', swapVariant);
  return (
    <>
      <AssetInput
        value={amountRepaid}
        onChange={handleRepayAmountChange}
        usdValue={exactOutputUsd}
        symbol={poolReserve.symbol}
        assets={assets}
        isMaxSelected={isMaxSelected}
        maxValue={debt}
        inputTitle={<Trans>Expected amount to repay</Trans>}
        balanceText={<Trans>Borrow balance</Trans>}
      />
      <Box sx={{ padding: '18px', pt: '14px', display: 'flex', justifyContent: 'space-between' }}>
        <SvgIcon sx={{ fontSize: '18px !important' }}>
          <ArrowDownIcon />
        </SvgIcon>

        <PriceImpactTooltip
          loading={loadingSkeleton}
          outputAmountUSD={outputAmountUSD}
          inputAmountUSD={inputAmountUSD}
        />
      </Box>
      <AssetInput
        value={
          swapVariant === 'exactOut'
            ? repayWithATokens
              ? amountRepaid
              : inputAmount
            : repayWithATokens
            ? exactOutputUsd
            : tokenToRepayWithBalance
        }
        usdValue={repayWithATokens ? exactOutputUsd : inputAmountUSD}
        symbol={tokenToRepayWith.symbol}
        assets={repayTokens}
        onSelect={setTokenToRepayWith}
        onChange={handleRepayAmountChange}
        inputTitle={<Trans>Collateral to repay with</Trans>}
        balanceText={<Trans>Borrow balance</Trans>}
        maxValue={tokenToRepayWithBalance}
        loading={loadingSkeleton}
        disableInput
      />

      {error && !loadingSkeleton && (
        <Typography variant="helperText" color="error.main">
          {error}
        </Typography>
      )}
      {blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          <BlockingError />
        </Typography>
      )}

      <TxModalDetails
        gasLimit={gasLimit}
        slippageSelector={
          <ListSlippageButton selectedSlippage={maxSlippage} setSlippage={setMaxSlippage} />
        }
      >
        <DetailsHFLine
          visibleHfChange={swapVariant === 'exactOut' ? !!amount : !!inputAmount}
          healthFactor={user?.healthFactor}
          futureHealthFactor={repayWithATokens ? newHFWithATokens : hfAfterSwap.toString(10)}
          loading={loadingSkeleton}
        />
        <DetailsNumberLineWithSub
          description={<Trans>Borrow balance after repay</Trans>}
          futureValue={amountAfterRepay.toString()}
          futureValueUSD={displayAmountAfterRepayInUsd.toString()}
          symbol={symbol}
          tokenIcon={poolReserve.iconSymbol}
          loading={loadingSkeleton}
          hideSymbolSuffix
        />
        <DetailsNumberLineWithSub
          description={<Trans>Collateral balance after repay</Trans>}
          futureValue={
            repayWithATokens
              ? aTokenBalanceAfterRepayment.toString()
              : collateralAmountAfterRepay.toString()
          }
          futureValueUSD={
            repayWithATokens
              ? aTokenBalanceAfterRepayment.toString()
              : collateralAmountAfterRepayUSD.toString()
          }
          symbol={tokenToRepayWith.symbol}
          tokenIcon={tokenToRepayWith.iconSymbol}
          loading={loadingSkeleton}
          hideSymbolSuffix
        />
      </TxModalDetails>

      {txError && <ParaswapErrorDisplay txError={txError} />}

      {collateralReserveData ? (
        <CollateralRepayActions
          poolReserve={poolReserve}
          fromAssetData={collateralReserveData}
          repayAmount={outputAmount}
          repayWithAmount={inputAmount}
          repayAllDebt={repayAllDebt}
          useFlashLoan={shouldUseFlashloan}
          isWrongNetwork={isWrongNetwork}
          symbol={symbol}
          rateMode={debtType}
          blocked={blockingError !== undefined || error !== ''}
          loading={routeLoading}
          buildTxFn={buildTxFn}
        />
      ) : (
        <RepayActions
          poolReserve={poolReserve}
          amountToRepay={isMaxSelected ? repayMaxAToken : amount}
          poolAddress={poolReserve.underlyingAsset}
          isWrongNetwork={isWrongNetwork}
          symbol={symbol}
          debtType={debtType}
          repayWithATokens={repayWithATokens}
        />
      )}
    </>
  );
}
