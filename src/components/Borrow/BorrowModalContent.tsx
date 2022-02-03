import { API_ETH_MOCK_ADDRESS, InterestRate } from '@aave/contract-helpers';
import {
  calculateHealthFactorFromBalancesBigUnits,
  ComputedUserReserve,
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
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { getMaxAmountAvailalbeToBorrow } from 'src/utils/utils';
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
  const [borrowUnWrapped, setBorrowUnWrapped] = useState(false);
  const [interestRateMode, setInterestRateMode] = useState<InterestRate>(InterestRate.Variable);
  const [amountToBorrow, setAmountToBorrow] = useState('');

  const networkConfig = getNetworkConfig(currentChainId);

  const poolReserve = reserves.find((reserve) => {
    if (underlyingAsset === API_ETH_MOCK_ADDRESS.toLowerCase() || borrowUnWrapped) {
      return reserve.symbol === networkConfig.wrappedBaseAssetSymbol;
    }
    return reserve.underlyingAsset === underlyingAsset;
  }) as ComputedReserveData;

  if (!user) {
    return null;
  }

  const userReserve = user.userReservesData.find((userReserve) => {
    if (underlyingAsset === API_ETH_MOCK_ADDRESS.toLowerCase() || borrowUnWrapped) {
      return poolReserve.underlyingAsset === userReserve.underlyingAsset;
    }
    return underlyingAsset === userReserve.underlyingAsset;
  }) as ComputedUserReserve;

  console.log('underlying asset: ', underlyingAsset);
  console.log('pool reserve', reserves);

  // interest rate mode calcs
  const currentStableBorrowRate =
    userReserve && userReserve.stableBorrows !== '0' && poolReserve.stableBorrowAPY;
  const newBorrowRate =
    interestRateMode === InterestRate.Variable
      ? poolReserve.variableBorrowAPY
      : poolReserve.stableBorrowAPY;

  // amount calculations
  const maxAmountToBorrow = getMaxAmountAvailalbeToBorrow(poolReserve, user);
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
            balance={formattedMaxAmountToBorrow}
            symbol={borrowUnWrapped ? poolReserve.symbol : poolReserve.symbol.substring(1)}
          />
          <TxModalDetails
            showHf={true}
            healthFactor={user.healthFactor}
            futureHealthFactor={newHealthFactor.toString()}
            gasLimit={gasLimit}
            setActionUnWrapped={
              poolReserve.symbol === networkConfig.wrappedBaseAssetSymbol
                ? setBorrowUnWrapped
                : undefined
            }
            symbol={poolReserve.symbol}
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
        poolAddress={borrowUnWrapped ? API_ETH_MOCK_ADDRESS : poolReserve.underlyingAsset}
        interestRateMode={interestRateMode}
      />
    </>
  );
};
