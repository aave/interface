import { InterestRate } from '@aave/contract-helpers';
import { USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { useRef, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import StyledToggleButton from 'src/components/StyledToggleButton';
import StyledToggleButtonGroup from 'src/components/StyledToggleButtonGroup';
import {
  ComputedReserveData,
  ComputedUserReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useSwap } from 'src/hooks/useSwap';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { calculateHFAfterRepay } from 'src/utils/hfUtils';

import { Asset, AssetInput } from '../AssetInput';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import { TxSuccessView } from '../FlowCommons/Success';
import {
  DetailsHFLine,
  DetailsNumberLineWithSub,
  TxModalDetails,
} from '../FlowCommons/TxModalDetails';
import { ErrorType, flashLoanNotAvailable, useFlashloan } from '../utils';
import { CollateralRepayActions } from './CollateralRepayActions';

export function CollateralRepayModalContent({
  poolReserve,
  symbol,
  debtType,
  userReserve,
  isWrongNetwork,
}: ModalWrapperProps & { debtType: InterestRate }) {
  const { user, marketReferencePriceInUsd, reserves, userReserves } = useAppDataContext();
  const { gasLimit, txError, mainTxState } = useModalContext();
  const { currentChainId, currentNetworkConfig } = useProtocolDataContext();
  const { currentAccount } = useWeb3Context();

  const repayTokens = user.userReservesData
    .filter(
      (userReserve) =>
        userReserve.underlyingBalance !== '0' &&
        userReserve.underlyingAsset !== poolReserve.underlyingAsset
    )
    .map((userReserve) => ({
      address: userReserve.underlyingAsset,
      balance: userReserve.underlyingBalance,
      symbol: userReserve.reserve.symbol,
      iconSymbol: userReserve.reserve.iconSymbol,
      aToken: true,
    }));
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
    fromAssetData.priceInMarketReferenceCurrency
  );
  const maxDebtThatCanBeRepaidWithSelectedCollateral = maxCollateral.dividedBy(
    poolReserve.priceInMarketReferenceCurrency
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

  const shouldUseFlashloan = useFlashloan(user.healthFactor, hfEffectOfFromAmount.toString());

  const disableFlashLoan =
    shouldUseFlashloan &&
    flashLoanNotAvailable(
      userReserve.underlyingAsset,
      currentNetworkConfig.underlyingChainId || currentChainId
    );

  // we need to get the min as minimumReceived can be greater than debt as we are swapping
  // a safe amount to repay all. When this happens amountAfterRepay would be < 0 and
  // this would show as certain amount left to repay when we are actually repaying all debt
  const amountAfterRepay = valueToBigNumber(debt).minus(BigNumber.min(outputAmount, debt));
  const displayAmountAfterRepayInUsd = amountAfterRepay
    .multipliedBy(poolReserve.formattedPriceInMarketReferenceCurrency)
    .multipliedBy(marketReferencePriceInUsd)
    .shiftedBy(-USD_DECIMALS);

  // calculate impact based on $ difference
  const priceImpact =
    outputAmountUSD && outputAmountUSD !== '0'
      ? new BigNumber(1)
          .minus(new BigNumber(inputAmountUSD).dividedBy(outputAmountUSD))
          .toString(10)
      : '0';

  let blockingError: ErrorType | undefined = undefined;
  const tokenToRepayWithUsdValue = valueToBigNumber(tokenToRepayWith?.balance || '0').multipliedBy(
    fromAssetData.priceInUSD
  );
  if (Number(usdValue) > Number(tokenToRepayWithUsdValue.toString(10))) {
    blockingError = ErrorType.NOT_ENOUGH_COLLATERAL_TO_REPAY_WITH;
  } else if (disableFlashLoan) {
    blockingError = ErrorType.FLASH_LOAN_NOT_AVAILABLE;
  }

  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_COLLATERAL_TO_REPAY_WITH:
        return <Trans>Not enough collateral to repay this amount of debt with</Trans>;
      case ErrorType.FLASH_LOAN_NOT_AVAILABLE:
        return (
          <Trans>
            Due to a precision bug in the stETH contract, this asset can not be used in flashloan
            transactions
          </Trans>
        );
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
        inputTitle={<Trans>Debt amount to repay</Trans>}
        balanceText={<Trans>Borrow balance</Trans>}
      />
      <AssetInput
        value={inputAmount}
        usdValue={inputAmountUSD}
        symbol={tokenToRepayWith.symbol}
        assets={repayTokens}
        onSelect={setTokenToRepayWith}
        inputTitle={<Trans>Collateral amount to repay with</Trans>}
        balanceText={<Trans>Borrow balance</Trans>}
        disableInput
      />
      {blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          {handleBlocked()}
        </Typography>
      )}
      <Box
        sx={{
          bgcolor: 'background.default',
          border: '1px solid rgba(56, 61, 81, 0.12)',
          borderRadius: '4px',
          padding: '8px 16px',
          mt: 6,
        }}
      >
        <Row caption={<Trans>Price impact</Trans>} captionVariant="subheader1">
          <FormattedNumber value={priceImpact} variant="secondary14" percent />
        </Row>
        <Row caption={<Trans>Minimum received</Trans>} captionVariant="subheader1" sx={{ mt: 4 }}>
          <FormattedNumber value={outputAmount} variant="secondary14" symbol={poolReserve.symbol} />
        </Row>
        <Typography variant="description" sx={{ mt: 4 }}>
          <Trans>Max slippage rate</Trans>
        </Typography>
        <StyledToggleButtonGroup
          sx={{ mt: 2 }}
          value={maxSlippage}
          onChange={(_e, value) => setMaxSlippage(value)}
          exclusive
        >
          <StyledToggleButton value="0.1" sx={{ minWidth: '74px' }}>
            <Typography variant="secondary14">0.1%</Typography>
          </StyledToggleButton>
          <StyledToggleButton value="0.5" sx={{ minWidth: '74px' }}>
            <Typography variant="secondary14">0.5%</Typography>
          </StyledToggleButton>
          <StyledToggleButton value="1" sx={{ minWidth: '74px' }}>
            <Typography variant="secondary14">1%</Typography>
          </StyledToggleButton>
        </StyledToggleButtonGroup>
      </Box>
      <TxModalDetails gasLimit={gasLimit}>
        <DetailsNumberLineWithSub
          description={<Trans>Remaining debt</Trans>}
          futureValue={amountAfterRepay.toString()}
          futureValueUSD={displayAmountAfterRepayInUsd.toString()}
          symbol={symbol}
        />
        <DetailsHFLine
          visibleHfChange={!!_amount}
          healthFactor={user?.healthFactor}
          futureHealthFactor={hfAfterSwap.toString(10)}
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
