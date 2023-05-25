import { API_ETH_MOCK_ADDRESS, InterestRate } from '@aave/contract-helpers';
import {
  calculateHealthFactorFromBalancesBigUnits,
  USD_DECIMALS,
  valueToBigNumber,
} from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Checkbox, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { APYTypeTooltip } from 'src/components/infoTooltips/APYTypeTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { Warning } from 'src/components/primitives/Warning';
import StyledToggleButton from 'src/components/StyledToggleButton';
import StyledToggleButtonGroup from 'src/components/StyledToggleButtonGroup';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { ERC20TokenType } from 'src/libs/web3-data-provider/Web3Provider';
import { getMaxAmountAvailableToBorrow } from 'src/utils/getMaxAmountAvailableToBorrow';

import { CapType } from '../../caps/helper';
import { AssetInput } from '../AssetInput';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import { TxSuccessView } from '../FlowCommons/Success';
import {
  DetailsHFLine,
  DetailsIncentivesLine,
  DetailsUnwrapSwitch,
  TxModalDetails,
} from '../FlowCommons/TxModalDetails';
import { BorrowActions } from './BorrowActions';

export enum ErrorType {
  STABLE_RATE_NOT_ENABLED,
  NOT_ENOUGH_LIQUIDITY,
  BORROWING_NOT_AVAILABLE,
  NOT_ENOUGH_BORROWED,
}

interface BorrowModeSwitchProps {
  interestRateMode: InterestRate;
  setInterestRateMode: (value: InterestRate) => void;
  variableRate: string;
  stableRate: string;
}

const BorrowModeSwitch = ({
  setInterestRateMode,
  interestRateMode,
  variableRate,
  stableRate,
}: BorrowModeSwitchProps) => {
  return (
    <Row
      caption={
        <APYTypeTooltip
          text={<Trans>Borrow APY rate</Trans>}
          key="APY type_modal"
          variant="description"
        />
      }
      captionVariant="description"
      mb={1}
      pt={5}
      flexDirection="column"
      align="flex-start"
      captionColor="text.secondary"
    >
      <StyledToggleButtonGroup
        color="primary"
        value={interestRateMode}
        exclusive
        onChange={(_, value) => setInterestRateMode(value)}
        sx={{ width: '100%', mt: 0.5 }}
      >
        <StyledToggleButton
          value={InterestRate.Variable}
          disabled={interestRateMode === InterestRate.Variable}
        >
          <Typography variant="subheader1" sx={{ mr: 1 }}>
            <Trans>Variable</Trans>
          </Typography>
          <FormattedNumber value={variableRate} percent variant="secondary14" />
        </StyledToggleButton>
        <StyledToggleButton
          value={InterestRate.Stable}
          disabled={interestRateMode === InterestRate.Stable}
        >
          <Typography variant="subheader1" sx={{ mr: 1 }}>
            <Trans>Stable</Trans>
          </Typography>
          <FormattedNumber value={stableRate} percent variant="secondary14" />
        </StyledToggleButton>
      </StyledToggleButtonGroup>
    </Row>
  );
};

export const BorrowModalContent = ({
  underlyingAsset,
  isWrongNetwork,
  poolReserve,
  userReserve,
  unwrap: borrowUnWrapped,
  setUnwrap: setBorrowUnWrapped,
  symbol,
  latestPriceRaw: latestPriceRaw,
  latestPriceExpo: latestPriceExpo,
  latestPriceUpdateData: latestPriceUpdateData,
}: ModalWrapperProps & {
  unwrap: boolean;
  setUnwrap: (unwrap: boolean) => void;
  latestPriceRaw: string;
  latestPriceExpo: number;
  latestPriceUpdateData: string[];
}) => {
  const { mainTxState: borrowTxState, gasLimit, txError } = useModalContext();
  const { user, marketReferencePriceInUsd } = useAppDataContext();
  const { currentNetworkConfig } = useProtocolDataContext();
  const { borrowCap, debtCeiling } = useAssetCaps();

  const [interestRateMode, setInterestRateMode] = useState<InterestRate>(InterestRate.Variable);
  const [_amount, setAmount] = useState('');
  const [riskCheckboxAccepted, setRiskCheckboxAccepted] = useState(false);
  const amountRef = useRef<string>();

  // amount calculations
  const maxAmountToBorrow = getMaxAmountAvailableToBorrow(poolReserve, user, interestRateMode);
  const formattedMaxAmountToBorrow = maxAmountToBorrow.toString(10);

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? maxAmountToBorrow.toString(10) : _amount;

  // We set this in a useEffect, so it doesn't constantly change when
  // max amount selected
  const handleChange = (_value: string) => {
    const maxSelected = _value === '-1';
    const value = maxSelected ? maxAmountToBorrow.toString() : _value;
    amountRef.current = value;
    setAmount(value);
  };

  // health factor calculations
  // const amountToBorrowInUsd = valueToBigNumber(amount)
  //   .multipliedBy(poolReserve.formattedPriceInMarketReferenceCurrency)
  //   .multipliedBy(marketReferencePriceInUsd)
  //   .shiftedBy(-USD_DECIMALS);
  const amountToBorrowInUsd = valueToBigNumber(amount)
    .multipliedBy(latestPriceRaw)
    .shiftedBy(latestPriceExpo);

  const newHealthFactor = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency: user.totalCollateralUSD,
    borrowBalanceMarketReferenceCurrency: valueToBigNumber(user.totalBorrowsUSD).plus(
      amountToBorrowInUsd
    ),
    currentLiquidationThreshold: user.currentLiquidationThreshold,
  });
  const displayRiskCheckbox =
    newHealthFactor.toNumber() < 1.5 && newHealthFactor.toString() !== '-1';

  // calculating input usd value
  const usdValue = valueToBigNumber(amount).multipliedBy(latestPriceRaw).shiftedBy(latestPriceExpo);

  // error types handling
  let blockingError: ErrorType | undefined = undefined;
  if (interestRateMode === InterestRate.Stable && !poolReserve.stableBorrowRateEnabled) {
    blockingError = ErrorType.STABLE_RATE_NOT_ENABLED;
  } else if (
    interestRateMode === InterestRate.Stable &&
    userReserve?.usageAsCollateralEnabledOnUser &&
    valueToBigNumber(amount).lt(userReserve?.underlyingBalance || 0)
  ) {
    blockingError = ErrorType.NOT_ENOUGH_BORROWED;
  } else if (valueToBigNumber(amount).gt(poolReserve.formattedAvailableLiquidity)) {
    blockingError = ErrorType.NOT_ENOUGH_LIQUIDITY;
  } else if (!poolReserve.borrowingEnabled) {
    blockingError = ErrorType.BORROWING_NOT_AVAILABLE;
  }

  // error render handling
  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.BORROWING_NOT_AVAILABLE:
        return <Trans>Borrowing is currently unavailable for {poolReserve.symbol}.</Trans>;
      case ErrorType.NOT_ENOUGH_BORROWED:
        return (
          <Trans>
            You can borrow this asset with a stable rate only if you borrow more than the amount you
            are supplying as collateral.
          </Trans>
        );
      case ErrorType.NOT_ENOUGH_LIQUIDITY:
        return (
          <>
            <Trans>
              There are not enough funds in the
              {poolReserve.symbol}
              reserve to borrow
            </Trans>
          </>
        );
      case ErrorType.STABLE_RATE_NOT_ENABLED:
        return <Trans>The Stable Rate is not enabled for this currency</Trans>;
      default:
        return null;
    }
  };

  // token info to add to wallet
  const addToken: ERC20TokenType = {
    address: underlyingAsset,
    symbol: poolReserve.iconSymbol,
    decimals: poolReserve.decimals,
  };

  if (borrowTxState.success)
    return (
      <TxSuccessView
        action={<Trans>Borrowed</Trans>}
        amount={amountRef.current}
        symbol={poolReserve.symbol}
        addToken={addToken}
      />
    );

  const incentive =
    interestRateMode === InterestRate.Stable
      ? poolReserve.sIncentivesData
      : poolReserve.vIncentivesData;
  return (
    <>
      {borrowCap.determineWarningDisplay({ borrowCap })}
      {poolReserve.isIsolated && debtCeiling.determineWarningDisplay({ debtCeiling })}

      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={usdValue.toString(10)}
        assets={[
          {
            balance: formattedMaxAmountToBorrow,
            symbol: symbol,
            iconSymbol:
              borrowUnWrapped && poolReserve.isWrappedBaseAsset
                ? currentNetworkConfig.baseAssetSymbol
                : poolReserve.iconSymbol,
          },
        ]}
        symbol={symbol}
        capType={CapType.borrowCap}
        isMaxSelected={isMaxSelected}
        maxValue={maxAmountToBorrow.toString(10)}
      />

      {blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          {handleBlocked()}
        </Typography>
      )}

      {poolReserve.stableBorrowRateEnabled && (
        <BorrowModeSwitch
          interestRateMode={interestRateMode}
          setInterestRateMode={setInterestRateMode}
          variableRate={poolReserve.variableBorrowAPY}
          stableRate={poolReserve.stableBorrowAPY}
        />
      )}

      <TxModalDetails gasLimit={gasLimit}>
        {poolReserve.isWrappedBaseAsset && (
          <DetailsUnwrapSwitch
            unwrapped={borrowUnWrapped}
            setUnWrapped={setBorrowUnWrapped}
            symbol={poolReserve.symbol}
            unwrappedSymbol={currentNetworkConfig.baseAssetSymbol}
          />
        )}
        <DetailsIncentivesLine incentives={incentive} symbol={poolReserve.symbol} />
        <DetailsHFLine
          visibleHfChange={!!_amount}
          healthFactor={user.healthFactor}
          futureHealthFactor={newHealthFactor.toString(10)}
        />
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

      <Warning severity="info" sx={{ my: 6 }}>
        <Trans>
          <b>Attention:</b> Parameter changes via governance can alter your account health factor
          and risk of liquidation. Follow the{' '}
          <a href="https://governance.aave.com/">Aave governance forum</a> for updates.
        </Trans>
      </Warning>

      <BorrowActions
        poolReserve={poolReserve}
        amountToBorrow={amount}
        poolAddress={
          borrowUnWrapped && poolReserve.isWrappedBaseAsset
            ? API_ETH_MOCK_ADDRESS
            : poolReserve.underlyingAsset
        }
        interestRateMode={interestRateMode}
        isWrongNetwork={isWrongNetwork}
        symbol={symbol}
        blocked={blockingError !== undefined || (displayRiskCheckbox && !riskCheckboxAccepted)}
        updateData={latestPriceUpdateData}
        sx={displayRiskCheckbox ? { mt: 0 } : {}}
      />
    </>
  );
};
