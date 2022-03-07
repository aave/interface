import { API_ETH_MOCK_ADDRESS, InterestRate } from '@aave/contract-helpers';
import {
  calculateHealthFactorFromBalancesBigUnits,
  USD_DECIMALS,
  valueToBigNumber,
} from '@aave/math-utils';
import { CheckIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { SvgIcon, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { APYTypeTooltip } from 'src/components/infoTooltips/APYTypeTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ERC20TokenType } from 'src/libs/web3-data-provider/Web3Provider';
import { getMaxAmountAvailableToBorrow } from 'src/utils/getMaxAmountAvailableToBorrow';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { CapType } from '../../caps/helper';
import { AssetInput } from '../AssetInput';
import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import {
  DetailsHFLine,
  DetailsIncentivesLine,
  DetailsUnwrapSwitch,
  TxModalDetails,
} from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { BorrowActions } from './BorrowActions';

export type BorrowModalContentProps = {
  underlyingAsset: string;
};

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
      <ToggleButtonGroup
        color="primary"
        value={interestRateMode}
        exclusive
        onChange={(_, value) => setInterestRateMode(value)}
        sx={{ width: '100%', mt: 0.5 }}
      >
        <ToggleButton
          value={InterestRate.Variable}
          disabled={interestRateMode === InterestRate.Variable}
        >
          {interestRateMode === InterestRate.Variable && (
            <SvgIcon sx={{ fontSize: '20px', mr: '2.5px' }}>
              <CheckIcon />
            </SvgIcon>
          )}
          <Typography variant="subheader1" sx={{ mr: 1 }}>
            <Trans>Variable</Trans>
          </Typography>
          <FormattedNumber value={variableRate} percent variant="secondary14" />
        </ToggleButton>
        <ToggleButton
          value={InterestRate.Stable}
          disabled={interestRateMode === InterestRate.Stable}
        >
          {interestRateMode === InterestRate.Stable && (
            <SvgIcon sx={{ fontSize: '20px', mr: '2.5px' }}>
              <CheckIcon />
            </SvgIcon>
          )}
          <Typography variant="subheader1" sx={{ mr: 1 }}>
            <Trans>Stable</Trans>
          </Typography>
          <FormattedNumber value={stableRate} percent variant="secondary14" />
        </ToggleButton>
      </ToggleButtonGroup>
    </Row>
  );
};

export const BorrowModalContent = ({ underlyingAsset }: BorrowModalContentProps) => {
  const { mainTxState: borrowTxState, gasLimit } = useModalContext();
  const { reserves, user, marketReferencePriceInUsd } = useAppDataContext();
  const { currentChainId } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();

  const [borrowUnWrapped, setBorrowUnWrapped] = useState(true);
  const [interestRateMode, setInterestRateMode] = useState<InterestRate>(InterestRate.Variable);
  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>();

  const networkConfig = getNetworkConfig(currentChainId);

  const poolReserve = reserves.find((reserve) => {
    return reserve.underlyingAsset === underlyingAsset;
  }) as ComputedReserveData;

  const userReserve = user?.userReservesData.find((reserve) => {
    return reserve.underlyingAsset === underlyingAsset;
  });

  // amount calculations
  const maxAmountToBorrow = getMaxAmountAvailableToBorrow(poolReserve, user, interestRateMode);
  const formattedMaxAmountToBorrow = maxAmountToBorrow.toString(10);

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? maxAmountToBorrow.toString() : _amount;

  // We set this in a useEffect, so it doesnt constantly change when
  // max amount selected
  const handleChange = (_value: string) => {
    const maxSelected = _value === '-1';
    const value = maxSelected ? maxAmountToBorrow.toString() : _value;
    amountRef.current = value;
    setAmount(value);
  };

  // health factor calculations
  const amountToBorrowInUsd = valueToBigNumber(amount)
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

  // calculating input usd value
  const usdValue = valueToBigNumber(amount).multipliedBy(poolReserve.priceInUSD);

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
            To prevent gaming the stable rate you can only borrow, when you borrow more then your
            current collateral in the same asset.
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

  if (borrowTxState.txError) return <TxErrorView errorMessage={borrowTxState.txError} />;
  if (borrowTxState.success)
    return (
      <TxSuccessView
        action="Borrowed"
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
      <TxModalTitle title="Borrow" symbol={poolReserve.symbol} />
      {isWrongNetwork && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
      )}

      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={usdValue.toString()}
        assets={[
          {
            balance: formattedMaxAmountToBorrow,
            symbol:
              borrowUnWrapped && poolReserve.isWrappedBaseAsset
                ? networkConfig.baseAssetSymbol
                : poolReserve.symbol,
            iconSymbol:
              borrowUnWrapped && poolReserve.isWrappedBaseAsset
                ? networkConfig.baseAssetSymbol
                : poolReserve.iconSymbol,
          },
        ]}
        symbol={
          borrowUnWrapped && poolReserve.isWrappedBaseAsset
            ? networkConfig.baseAssetSymbol
            : poolReserve.iconSymbol
        }
        capType={CapType.borrowCap}
        isMaxSelected={isMaxSelected}
        maxValue={maxAmountToBorrow.toString()}
      />

      {blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          {handleBlocked()}
        </Typography>
      )}
      {blockingError === undefined &&
        newHealthFactor.toNumber() < 1.5 &&
        newHealthFactor.toNumber() >= 1 && (
          <Typography variant="helperText" color="warning.main">
            <Trans>Liquidation risk is high. Lower amounts recommended.</Trans>
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
            unwrappedSymbol={networkConfig.baseAssetSymbol}
          />
        )}
        <DetailsIncentivesLine incentives={incentive} symbol={poolReserve.symbol} />
        <DetailsHFLine
          visibleHfChange={!!_amount}
          healthFactor={user.healthFactor}
          futureHealthFactor={newHealthFactor.toString()}
        />
      </TxModalDetails>

      {borrowTxState.gasEstimationError && (
        <GasEstimationError error={borrowTxState.gasEstimationError} />
      )}

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
        symbol={
          borrowUnWrapped && poolReserve.isWrappedBaseAsset
            ? networkConfig.baseAssetSymbol
            : poolReserve.symbol
        }
        blocked={blockingError !== undefined}
      />
    </>
  );
};
