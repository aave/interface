import { InterestRate } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { useRef, useState } from 'react';
import {
  ComputedReserveData,
  ComputedUserReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useSwap } from 'src/hooks/useSwap';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { Asset, AssetInput } from '../AssetInput';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import {
  DetailsHFLine,
  DetailsNumberLineWithSub,
  TxModalDetails,
} from '../FlowCommons/TxModalDetails';
import { CollateralRepayActions } from './CollateralRepayActions';
import BigNumber from 'bignumber.js';
import { calculateHFAfterRepay } from 'src/utils/hfUtils';
import { Box, Typography, SvgIcon } from '@mui/material';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { ListSlippageButton } from 'src/modules/dashboard/lists/SlippageList';
import { ArrowDownIcon } from '@heroicons/react/outline';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { PriceImpactTooltip } from 'src/components/infoTooltips/PriceImpactTooltip';

export enum ErrorType {
  NOT_ENOUGH_COLLATERAL_TO_REPAY_WITH,
}

export function CollateralRepayModalContent({
  poolReserve,
  symbol,
  debtType,
  userReserve,
  isWrongNetwork,
}: ModalWrapperProps & { debtType: InterestRate }) {
  const { user, reserves, userReserves } = useAppDataContext();
  const { gasLimit, txError, mainTxState } = useModalContext();
  const { currentChainId, currentNetworkConfig } = useProtocolDataContext();
  const { currentAccount } = useWeb3Context();

  // List of tokens eligble to repay with, ordered by USD value
  const repayTokens = user.userReservesData
    .filter(
      (userReserve) =>
        userReserve.underlyingBalance !== '0' &&
        userReserve.underlyingAsset !== poolReserve.underlyingAsset
    )
    .map((userReserve) => ({
      address: userReserve.underlyingAsset,
      balance: userReserve.underlyingBalance,
      balanceUSD: userReserve.underlyingBalanceUSD,
      symbol: userReserve.reserve.symbol,
      iconSymbol: userReserve.reserve.iconSymbol,
    }))
    .sort((a, b) => Number(b.balanceUSD) - Number(a.balanceUSD));
  const [tokenToRepayWith, setTokenToRepayWith] = useState<Asset>(repayTokens[0]);

  const fromAssetData = reserves.find(
    (reserve) => reserve.underlyingAsset === tokenToRepayWith.address
  ) as ComputedReserveData;

  const repayWithUserReserve = userReserves.find(
    (userReserve) => userReserve.underlyingAsset === tokenToRepayWith.address
  ) as ComputedUserReserveData;

  const [_amount, setAmount] = useState('');
  const [maxSlippage, setMaxSlippage] = useState('0.5');

  const amountRef = useRef<string>('');

  const debt =
    debtType === InterestRate.Stable
      ? userReserve?.stableBorrows || '0'
      : userReserve?.variableBorrows || '0';
  const safeAmountToRepayAll = valueToBigNumber(debt).multipliedBy('1.0025');

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? safeAmountToRepayAll.toString() : _amount;
  const usdValue = valueToBigNumber(amount).multipliedBy(poolReserve.priceInUSD);

  const { priceRoute, inputAmountUSD, inputAmount, outputAmount, outputAmountUSD } = useSwap({
    chainId: currentNetworkConfig.underlyingChainId || currentChainId,
    userId: currentAccount,
    variant: 'exactOut',
    swapIn: { ...fromAssetData, amount: '0' },
    swapOut: { ...poolReserve, amount: amountRef.current },
    max: isMaxSelected,
    skip: mainTxState.loading,
  });

  // Calculations to get the max repayable debt depending on the balance and value of the
  // selected collateral
  const maxCollateral = valueToBigNumber(tokenToRepayWith?.balance || 0).multipliedBy(
    fromAssetData.priceInUSD
  );
  const maxDebtThatCanBeRepaidWithSelectedCollateral = maxCollateral.dividedBy(
    poolReserve.priceInUSD
  );
  const maxRepayableDebt = BigNumber.min(
    maxDebtThatCanBeRepaidWithSelectedCollateral,
    safeAmountToRepayAll
  );
  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? maxRepayableDebt.toString(10) : value;
    setAmount(value);
  };
  // for v3 we need hf after withdraw collateral, because when removing collateral to repay
  // debt, hf could go under 1 then it would fail. If that is the case then we need
  // to use flashloan path
  const { hfAfterSwap, hfEffectOfFromAmount } = calculateHFAfterRepay({
    amountToReceiveAfterSwap: outputAmount,
    amountToSwap: inputAmount,
    fromAssetData,
    user,
    toAssetData: poolReserve,
    repayWithUserReserve,
    debt,
  });

  const shouldUseFlashloan =
    user.healthFactor !== '-1' &&
    new BigNumber(user.healthFactor).minus(hfEffectOfFromAmount).lt('1.05');

  // we need to get the min as minimumReceived can be greater than debt as we are swapping
  // a safe amount to repay all. When this happens amountAfterRepay would be < 0 and
  // this would show as certain amount left to repay when we are actually repaying all debt
  const amountAfterRepay = valueToBigNumber(debt).minus(BigNumber.min(outputAmount, debt));
  const displayAmountAfterRepayInUsd = amountAfterRepay.multipliedBy(poolReserve.priceInUSD);
  const collateralAmountAfterRepay = tokenToRepayWith.balance
    ? valueToBigNumber(tokenToRepayWith.balance).minus(inputAmount)
    : valueToBigNumber('0');
  const collateralAmountAfterRepayUSD = collateralAmountAfterRepay.multipliedBy(
    fromAssetData.priceInUSD
  );

  // calculate impact based on $ difference
  let priceImpact =
    outputAmountUSD && outputAmountUSD !== '0'
      ? new BigNumber(1).minus(new BigNumber(inputAmountUSD).dividedBy(outputAmountUSD)).toFixed(2)
      : '0';
  if (priceImpact === '-0.00') {
    priceImpact = '0.00';
  }

  let blockingError: ErrorType | undefined = undefined;
  const tokenToRepayWithUsdValue = valueToBigNumber(tokenToRepayWith?.balance || '0').multipliedBy(
    fromAssetData.priceInUSD
  );
  if (Number(usdValue) > Number(tokenToRepayWithUsdValue.toString(10))) {
    blockingError = ErrorType.NOT_ENOUGH_COLLATERAL_TO_REPAY_WITH;
  }

  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_COLLATERAL_TO_REPAY_WITH:
        return <Trans>Not enough collateral to repay this amount of debt with</Trans>;
      default:
        return null;
    }
  };

  if (mainTxState.success)
    return (
      <TxSuccessView
        action={<Trans>repaid</Trans>}
        amount={amountRef.current}
        symbol={poolReserve.symbol}
      />
    );

  return (
    <>
      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={usdValue.toString()}
        symbol={poolReserve.symbol}
        assets={[
          {
            address: poolReserve.underlyingAsset,
            symbol: poolReserve.symbol,
            iconSymbol: poolReserve.iconSymbol,
            balance: debt,
          },
        ]}
        isMaxSelected={isMaxSelected}
        maxValue={debt}
        inputTitle={<Trans>Expected amount to repay</Trans>}
        balanceText="Borrow balance"
      />
      <Box sx={{ padding: '18px', pt: '14px', display: 'flex', justifyContent: 'space-between' }}>
        <SvgIcon sx={{ fontSize: '18px !important' }}>
          <ArrowDownIcon />
        </SvgIcon>

        <PriceImpactTooltip
          text={
            <Trans>
              Price impact{' '}
              <FormattedNumber value={priceImpact} variant="secondary12" color="text.secondary" />%
            </Trans>
          }
          variant="secondary14"
        />
      </Box>
      <AssetInput
        value={inputAmount}
        usdValue={inputAmountUSD}
        symbol={tokenToRepayWith.symbol}
        assets={repayTokens}
        onSelect={setTokenToRepayWith}
        onChange={handleChange}
        inputTitle={<Trans>Collateral to repay with</Trans>}
        maxValue={tokenToRepayWith.balance ? tokenToRepayWith.balance : '0'}
        disableInput
        balanceText="Collateral balance"
      />
      {blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          {handleBlocked()}
        </Typography>
      )}

      <TxModalDetails
        gasLimit={gasLimit}
        slippageSelector={
          <ListSlippageButton selectedSlippage={maxSlippage} setSlippage={setMaxSlippage} />
        }
      >
        <DetailsHFLine
          visibleHfChange={!!_amount}
          healthFactor={user?.healthFactor}
          futureHealthFactor={hfAfterSwap.toString(10)}
        />
        <DetailsNumberLineWithSub
          description={<Trans>Borrow balance after repay</Trans>}
          futureValue={amountAfterRepay.toString()}
          futureValueUSD={displayAmountAfterRepayInUsd.toString()}
          symbol={symbol}
          tokenIcon={poolReserve.iconSymbol}
        />
        <DetailsNumberLineWithSub
          description={<Trans>Collateral balance after repay</Trans>}
          futureValue={collateralAmountAfterRepay.toString()}
          futureValueUSD={collateralAmountAfterRepayUSD.toString()}
          symbol={tokenToRepayWith.symbol}
          tokenIcon={tokenToRepayWith.iconSymbol}
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      <CollateralRepayActions
        poolReserve={poolReserve}
        fromAssetData={fromAssetData}
        repayAmount={outputAmount}
        repayWithAmount={inputAmount}
        repayAllDebt={isMaxSelected}
        useFlashLoan={shouldUseFlashloan}
        isWrongNetwork={isWrongNetwork}
        symbol={symbol}
        rateMode={debtType}
        priceRoute={priceRoute}
        blocked={blockingError !== undefined}
        maxSlippage={Number(maxSlippage)}
      />
    </>
  );
}
