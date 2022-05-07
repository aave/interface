import { InterestRate } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { SyntheticEvent, useRef, useState } from 'react';
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
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { MaxRepayWithCollateralTooltip } from 'src/components/infoTooltips/MaxRepayWithCollateralTooltip';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { CustomSlider } from 'src/components/CustomSlider';
import { SlippageModal } from 'src/components/SlippageModal';
import { PriceImpactTooltip } from 'src/components/infoTooltips/PriceImpactTooltip';

export enum ErrorType {
  NOT_ENOUGH_COLLATERAL_TO_REPAY_WITH,
}

interface CollateralSelection {
  amount: string;
  amountUSD: string;
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
      aToken: true,
    }))
    .sort((a, b) => Number(b.balanceUSD) - Number(a.balanceUSD));
  const [tokenToRepayWith, setTokenToRepayWith] = useState<Asset>(repayTokens[0]);

  const fromAssetData = reserves.find(
    (reserve) => reserve.underlyingAsset === tokenToRepayWith.address
  ) as ComputedReserveData;

  const repayWithUserReserve = userReserves.find(
    (userReserve) => userReserve.underlyingAsset === tokenToRepayWith.address
  ) as ComputedUserReserveData;

  const [slippageModalOpen, setSlippageModalOpen] = useState(false);
  const [maxSlippage, setMaxSlippage] = useState('0.1');
  const [dragActive, setDragActive] = useState(false);

  const [collateralSelection, setCollateralSelection] = useState<CollateralSelection>({
    amount: '',
    amountUSD: '0',
  });
  const [debtAmount, setDebtAmount] = useState('');
  const [maxSelected, setMaxSelected] = useState(false);
  const amountRef = useRef<string>('0');

  const debt =
    debtType === InterestRate.Stable
      ? userReserve?.stableBorrows || '0'
      : userReserve?.variableBorrows || '0';
  const debtUSD =
    debtType === InterestRate.Stable
      ? userReserve?.stableBorrowsUSD || '0'
      : userReserve?.variableBorrowsUSD || '0';
  const safeAmountToRepayAll = valueToBigNumber(debt).multipliedBy('1.0025');

  // Paraswap API Call
  const {
    priceRoute,
    inputAmountUSD,
    inputAmount,
    outputAmount,
    outputAmountUSD,
    loading: loadingParaswapCall,
  } = useSwap({
    chainId: currentNetworkConfig.underlyingChainId || currentChainId,
    userId: currentAccount,
    variant: 'exactOut',
    swapIn: { ...fromAssetData, amount: '0' },
    swapOut: { ...poolReserve, amount: amountRef.current },
    max: maxSelected,
    skip: mainTxState.loading,
    maxSlippage,
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
  // Max avilable balance for input box and slider
  const maxRepayableCollateral = maxRepayableDebt
    .multipliedBy(poolReserve.priceInUSD)
    .dividedBy(fromAssetData.priceInUSD);

  // Update collateral and debt amount based on input from slider or text box
  const updateAmounts = (value: string, isMax: boolean, apiCall: boolean) => {
    setMaxSelected(isMax);
    const collateralAmount = isMax ? maxRepayableCollateral.toString(10) : value;
    const usd = valueToBigNumber(collateralAmount).multipliedBy(fromAssetData.priceInUSD);
    const selectedDebt = usd.isNaN() ? '0' : usd.dividedBy(poolReserve.priceInUSD);
    setCollateralSelection({
      amount: collateralAmount,
      amountUSD: usd.isNaN() ? '0' : usd.toString(10),
    });
    setDebtAmount(selectedDebt.toString(10));
    if (apiCall && !usd.isNaN()) {
      // Set ref value for calculating Paraswap inputs
      amountRef.current = selectedDebt.toString(10);
    }
  };

  // Update amount from text box and make paraswap api call
  const handleChange = (value: string) => {
    const isMax: boolean = value === '-1';
    updateAmounts(value, isMax, true);
  };

  // On slider drag, update amounts but do not make paraswap api call
  const handleSliderDrag = (_event: Event, value: number | number[]) => {
    const newValue = (value as number).toString();
    const isMax: boolean = value === maxRepayableCollateral.toNumber();
    setDragActive(true);
    updateAmounts(newValue, isMax, false);
  };

  // On slider release (or click), update amounts and make api call
  const handleSliderRelease = (
    _event: Event | SyntheticEvent<Element, Event>,
    value: number | number[]
  ) => {
    const newValue = (value as number).toString();
    const isMax: boolean = value === maxRepayableCollateral.toNumber();
    setDragActive(false);
    updateAmounts(newValue, isMax, true);
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

  // calculate impact based on $ difference
  const priceImpact =
    outputAmountUSD && outputAmountUSD !== '0'
      ? new BigNumber(1)
          .minus(new BigNumber(inputAmountUSD).dividedBy(outputAmountUSD))
          .absoluteValue()
          .toString(10)
      : '0';

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
        value={collateralSelection.amount}
        usdValue={collateralSelection.amountUSD}
        symbol={tokenToRepayWith.symbol}
        assets={repayTokens}
        onSelect={setTokenToRepayWith}
        onChange={handleChange}
        maxBalanceText={'Available balance'}
        useMaxBalance={true}
        maxBalanceTooltip={<MaxRepayWithCollateralTooltip />}
        maxValue={maxRepayableCollateral.toString()}
        inputTitle={<Trans>Collateral to repay with</Trans>}
      />
      <Box sx={{ width: '96.5%', margin: '0 auto' }}>
        <CustomSlider
          value={Number(collateralSelection.amount)}
          min={0}
          max={maxRepayableCollateral.toNumber()}
          step={maxRepayableCollateral.toNumber() / 100}
          onChange={handleSliderDrag}
          onChangeCommitted={handleSliderRelease}
          valueLabelDisplay="off"
          marks={[
            { value: 0, label: `0 ${tokenToRepayWith.symbol}` },
            {
              value: maxRepayableCollateral.toNumber(),
              label: `${maxRepayableCollateral.toFixed(5)} ${tokenToRepayWith.symbol}`,
            },
          ]}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', pt: '24px', pb: '4px' }}>
        <Typography color="text.secondary">
          <Trans>Expected amount to repay</Trans>
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', pt: '6px' }}>
          <TokenIcon symbol={poolReserve.iconSymbol} sx={{ mr: 1, fontSize: '21px' }} />
          <FormattedNumber
            value={debtAmount === '-1' || Number(debtAmount) > Number(debt) ? debt : debtAmount}
            variant="description21"
            sx={{ mr: '4px' }}
          />
          <Typography variant="description21" color="text.primary">
            {poolReserve.symbol}
          </Typography>
        </Box>

        <Typography
          variant="subheader2"
          color="text.muted"
          sx={{ display: 'inline-flex', pt: '6px' }}
        >
          <FormattedNumber
            symbol={'USD'}
            value={collateralSelection.amountUSD}
            variant="subheader2"
            symbolsVariant="subheader2"
            color="text.muted"
            symbolsColor="text.muted"
          />
          <Box sx={{ px: '8px' }}>&#8226;</Box>
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <Box sx={{ pr: '4px' }}>
              <PriceImpactTooltip
                variant="subheader2"
                color="text.muted"
                text={<Trans>Price impact</Trans>}
              />
            </Box>

            {loadingParaswapCall || dragActive ? (
              <CircularProgress color="inherit" size="12px" sx={{ mx: 2 }} />
            ) : (
              ' ' + Number(priceImpact).toFixed(2) + ' %'
            )}
          </Box>
        </Typography>
      </Box>

      <TxModalDetails
        gasLimit={gasLimit}
        slippageSelector={
          <Button variant="text" onClick={() => setSlippageModalOpen(true)} sx={{ mt: 6 }}>
            <Typography variant="secondary14" color="#0062D2">
              <Trans>Slippage tolerance {maxSlippage}%</Trans>
            </Typography>
          </Button>
        }
      >
        <DetailsHFLine
          visibleHfChange={!!debtAmount}
          healthFactor={user?.healthFactor}
          futureHealthFactor={hfAfterSwap.toString(10)}
        />
        <DetailsNumberLineWithSub
          description={<Trans>Total outstanding debt</Trans>}
          futureValue={debt.toString()}
          futureValueUSD={debtUSD.toString()}
          symbol={symbol}
          tokenIcon={poolReserve.iconSymbol}
        />
        <DetailsNumberLineWithSub
          description={<Trans>Remaining debt after repay</Trans>}
          futureValue={amountAfterRepay.toString()}
          futureValueUSD={displayAmountAfterRepayInUsd.toString()}
          symbol={symbol}
          tokenIcon={poolReserve.iconSymbol}
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      <SlippageModal
        open={slippageModalOpen}
        setOpen={setSlippageModalOpen}
        value={maxSlippage}
        setSlippage={setMaxSlippage}
      />

      <CollateralRepayActions
        poolReserve={poolReserve}
        fromAssetData={fromAssetData}
        repayAmount={outputAmount}
        repayWithAmount={inputAmount}
        repayAllDebt={maxSelected}
        useFlashLoan={shouldUseFlashloan}
        isWrongNetwork={isWrongNetwork}
        symbol={symbol}
        rateMode={debtType}
        priceRoute={priceRoute}
        blocked={false}
      />
    </>
  );
}
