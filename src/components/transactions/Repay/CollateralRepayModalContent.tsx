import { InterestRate } from '@aave/contract-helpers';
import { USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { useRef, useState } from 'react';
import {
  ComputedReserveData,
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
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { Row } from 'src/components/primitives/Row';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';

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
  const { user, marketReferencePriceInUsd, reserves } = useAppDataContext();
  const { gasLimit, txError, mainTxState } = useModalContext();
  const { currentChainId } = useProtocolDataContext();
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

  const repayWithReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === tokenToRepayWith.address
  ) as ComputedReserveData;

  const [_amount, setAmount] = useState('');
  const [maxSlippage, setMaxSlippage] = useState('0.1');
  const [repayMax, setRepayMax] = useState('');

  const amountRef = useRef<string>('');

  const debt =
    debtType === InterestRate.Stable ? userReserve.stableBorrows : userReserve.variableBorrows;
  const safeAmountToRepayAll = valueToBigNumber(debt).multipliedBy('1.0025');

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? safeAmountToRepayAll.toString() : _amount;
  const usdValue = valueToBigNumber(amount).multipliedBy(poolReserve.priceInUSD);

  const { priceRoute, inputAmountUSD, inputAmount, outputAmount, outputAmountUSD } = useSwap({
    chainId: currentChainId,
    userId: currentAccount,
    variant: 'exactOut',
    swapIn: { ...repayWithReserve, amount: '0' },
    swapOut: { ...poolReserve, amount: amountRef.current },
    max: isMaxSelected,
    skip: mainTxState.loading,
  });

  const minimumReceived = new BigNumber(outputAmount || '0')
    .multipliedBy(new BigNumber(100).minus(maxSlippage).dividedBy(100))
    .toString(10);

  // Calculations to get the max repayable debt depending on the balance and value of the
  // selected collateral
  const maxCollateral = valueToBigNumber(tokenToRepayWith?.balance || 0).multipliedBy(
    repayWithReserve.priceInMarketReferenceCurrency
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
    if (maxSelected) {
      setRepayMax(maxRepayableDebt.toString(10));
    }
  };

  // for v3 we need hf after withdraw collateral, because when removing collateral to repay
  // debt, hf could go under 1 then it would fail. If that is the case then we need
  // to use flashloan path
  const { hfAfterSwap, hfEffectOfFromAmount } = calculateHFAfterRepay({
    fromAmountAfterSlippage: minimumReceived,
    fromAssetData: repayWithReserve,
    user,
    amountToRepay: amount,
    toAssetData: poolReserve,
    userReserve,
  });

  const shouldUseFlashloan =
    user.healthFactor !== '-1' &&
    new BigNumber(user.healthFactor).minus(hfEffectOfFromAmount).lt('1.05');

  // we need to get the min as minimumReceived can be greater than debt as we are swapping
  // a safe amount to repay all. When this happens amountAfterRepay would be < 0 and
  // this would show as certain amount left to repay when we are actually repaying all debt
  const amountAfterRepay = valueToBigNumber(debt).minus(BigNumber.min(minimumReceived, debt));
  console.log(`
    debt            : ${debt}
    minimumReceived : ${minimumReceived}
    amountAfterRepay: ${amountAfterRepay.toString(10)}
  `);
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
    repayWithReserve.priceInUSD
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
        maxValue={repayMax /*debt*/}
      />
      <AssetInput
        value={inputAmount}
        usdValue={inputAmountUSD}
        symbol={tokenToRepayWith.symbol}
        assets={repayTokens}
        onSelect={setTokenToRepayWith}
        disableInput
      />
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
          <FormattedNumber
            value={minimumReceived}
            variant="secondary14"
            symbol={tokenToRepayWith.symbol}
          />
        </Row>
        <Typography variant="description" sx={{ mt: 4 }}>
          <Trans>Max slippage rate</Trans>
        </Typography>
        <ToggleButtonGroup
          sx={{ mt: 2 }}
          value={maxSlippage}
          onChange={(_e, value) => setMaxSlippage(value)}
          exclusive
        >
          <ToggleButton value="0.1" sx={{ minWidth: '74px' }}>
            <Typography variant="secondary14">0.1%</Typography>
          </ToggleButton>
          <ToggleButton value="0.5" sx={{ minWidth: '74px' }}>
            <Typography variant="secondary14">0.5%</Typography>
          </ToggleButton>
          <ToggleButton value="1" sx={{ minWidth: '74px' }}>
            <Typography variant="secondary14">1%</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          {handleBlocked()}
        </Typography>
      )}
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
        repayWithReserve={repayWithReserve}
        amountToRepay={isMaxSelected ? repayMax : amount}
        amountToSwap={outputAmount}
        isMaxSelected={isMaxSelected}
        useFlashLoan={shouldUseFlashloan}
        isWrongNetwork={isWrongNetwork}
        symbol={symbol}
        debtType={debtType}
        priceRoute={priceRoute}
      />
    </>
  );
}
