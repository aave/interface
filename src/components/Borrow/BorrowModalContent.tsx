import { API_ETH_MOCK_ADDRESS, InterestRate } from '@aave/contract-helpers';
import {
  calculateHealthFactorFromBalancesBigUnits,
  USD_DECIMALS,
  valueToBigNumber,
} from '@aave/math-utils';
import { useState } from 'react';
import { TxState } from 'src/helpers/types';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getMaxAmountAvailableToBorrow } from 'src/utils/getMaxAmountAvailableToBorrow';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { AssetInput } from '../AssetInput';
import { TxErrorView } from '../FlowCommons/Error';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { BorrowActions } from './BorrowActions';

export type BorrowModalContentProps = {
  underlyingAsset: string;
  handleClose: () => void;
};

export const BorrowModalContent = ({ underlyingAsset, handleClose }: BorrowModalContentProps) => {
  const { reserves, user, marketReferencePriceInUsd } = useAppDataContext();
  const { currentChainId } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();

  const [gasLimit, setGasLimit] = useState<string | undefined>(undefined);
  const [borrowTxState, setBorrowTxState] = useState<TxState>({ success: false });
  const [borrowUnWrapped, setBorrowUnWrapped] = useState(true);
  const [interestRateMode, setInterestRateMode] = useState<InterestRate>(InterestRate.Variable);
  const [amountToBorrow, setAmountToBorrow] = useState('');

  const networkConfig = getNetworkConfig(currentChainId);

  const poolReserve = reserves.find((reserve) => {
    if (underlyingAsset === API_ETH_MOCK_ADDRESS.toLowerCase()) {
      return reserve.symbol === networkConfig.wrappedBaseAssetSymbol;
    }
    return reserve.underlyingAsset === underlyingAsset;
  }) as ComputedReserveData;

  if (!user) {
    return null;
  }

  // const userReserve = user.userReservesData.find((userReserve) => {
  //   if (underlyingAsset === API_ETH_MOCK_ADDRESS.toLowerCase() || borrowUnWrapped) {
  //     return poolReserve.underlyingAsset === userReserve.underlyingAsset;
  //   }
  //   return underlyingAsset === userReserve.underlyingAsset;
  // }) as ComputedUserReserve;

  // amount calculations
  const maxAmountToBorrow = getMaxAmountAvailableToBorrow(poolReserve, user);
  const formattedMaxAmountToBorrow = maxAmountToBorrow.toString(10);

  // amount checks
  let blockingError = '';
  let userAvailableAmountToBorrow = valueToBigNumber(
    user.availableBorrowsMarketReferenceCurrency
  ).div(poolReserve.formattedPriceInMarketReferenceCurrency);

  if (
    userAvailableAmountToBorrow.gt(0) &&
    user?.totalBorrowsMarketReferenceCurrency !== '0' &&
    userAvailableAmountToBorrow.lt(
      valueToBigNumber(poolReserve.formattedAvailableLiquidity).multipliedBy('1.01')
    )
  ) {
    userAvailableAmountToBorrow = userAvailableAmountToBorrow.multipliedBy('0.995');
  }

  if (interestRateMode === InterestRate.Stable && !poolReserve.stableBorrowRateEnabled) {
    blockingError = ''; //intl.formatMessage(messages.errorStableRateNotEnabled);
  }
  if (valueToBigNumber(amountToBorrow).gt(poolReserve.formattedAvailableLiquidity)) {
    blockingError = ''; //intl.formatMessage(messages.errorNotEnoughLiquidity, {
    //   currencySymbol,
    // });
  }
  if (userAvailableAmountToBorrow.lt(amountToBorrow)) {
    blockingError = ''; //intl.formatMessage(messages.errorNotEnoughCollateral);
  }
  if (!poolReserve.borrowingEnabled) {
    blockingError = ''; //intl.formatMessage(messages.errorBorrowingNotAvailable);
  }

  // TODO: do somehting with blocking error:
  console.log('blocking error: ', blockingError);

  // health factor calculations
  const amountToBorrowInUsd = valueToBigNumber(amountToBorrow)
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

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  return (
    <>
      {!borrowTxState.error && !borrowTxState.success && (
        <>
          <TxModalTitle title="Borrow" symbol={poolReserve.symbol} />
          {isWrongNetwork && (
            <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
          )}

          <AssetInput
            value={amountToBorrow}
            onChange={setAmountToBorrow}
            // usdValue={amountInUsd.toString()}
            assets={[
              {
                balance: formattedMaxAmountToBorrow,
                symbol:
                  borrowUnWrapped && poolReserve.symbol === networkConfig.wrappedBaseAssetSymbol
                    ? networkConfig.baseAssetSymbol
                    : poolReserve.symbol,
              },
            ]}
            symbol={
              borrowUnWrapped && poolReserve.symbol === networkConfig.wrappedBaseAssetSymbol
                ? networkConfig.baseAssetSymbol
                : poolReserve.symbol
            }
          />
          <TxModalDetails
            showHf={true}
            healthFactor={user.healthFactor}
            futureHealthFactor={newHealthFactor.toString()}
            gasLimit={gasLimit}
            incentives={poolReserve.vIncentivesData}
            stableRateIncentives={poolReserve.sIncentivesData}
            setActionUnWrapped={
              poolReserve.symbol === networkConfig.wrappedBaseAssetSymbol
                ? setBorrowUnWrapped
                : undefined
            }
            unWrappedSymbol={networkConfig.baseAssetSymbol}
            actionUnWrapped={borrowUnWrapped}
            symbol={poolReserve.symbol}
            apy={poolReserve.variableBorrowAPY}
            borrowStableRate={
              poolReserve.stableBorrowRateEnabled ? poolReserve.stableBorrowAPY : undefined
            }
            setInterestRateMode={setInterestRateMode}
            action="Borrow"
          />
        </>
      )}

      {borrowTxState.error && <TxErrorView errorMessage={borrowTxState.error} />}
      {borrowTxState.success && !borrowTxState.error && (
        <TxSuccessView action="Withdrawed" amount={amountToBorrow} symbol={poolReserve.symbol} />
      )}
      <BorrowActions
        poolReserve={poolReserve}
        setGasLimit={setGasLimit}
        setBorrowTxState={setBorrowTxState}
        amountToBorrow={amountToBorrow}
        handleClose={handleClose}
        poolAddress={
          borrowUnWrapped && poolReserve.symbol === networkConfig.wrappedBaseAssetSymbol
            ? API_ETH_MOCK_ADDRESS
            : poolReserve.underlyingAsset
        }
        interestRateMode={interestRateMode}
        isWrongNetwork={isWrongNetwork}
        symbol={
          borrowUnWrapped && poolReserve.symbol === networkConfig.wrappedBaseAssetSymbol
            ? networkConfig.baseAssetSymbol
            : poolReserve.symbol
        }
      />
    </>
  );
};
