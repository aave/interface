import { InterestRate } from '@aave/contract-helpers';
import {
  calculateHealthFactorFromBalancesBigUnits,
  USD_DECIMALS,
  valueToBigNumber,
} from '@aave/math-utils';
import { ArrowNarrowRightIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Checkbox, SvgIcon, Typography } from '@mui/material';
import React, { useState } from 'react';
import {
  GhoIncentivesCard,
  GhoIncentivesCardProps,
} from 'src/components/incentives/GhoIncentivesCard';
import { APYTypeTooltip } from 'src/components/infoTooltips/APYTypeTooltip';
import { FixedAPYTooltip } from 'src/components/infoTooltips/FixedAPYTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { NoData } from 'src/components/primitives/NoData';
import { Row } from 'src/components/primitives/Row';
import { Warning } from 'src/components/primitives/Warning';
import { StyledTxModalToggleButton } from 'src/components/StyledToggleButton';
import { StyledTxModalToggleGroup } from 'src/components/StyledToggleButtonGroup';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { ERC20TokenType } from 'src/libs/web3-data-provider/Web3Provider';
import { getMaxGhoMintAmount } from 'src/utils/getMaxAmountAvailableToBorrow';
import { weightedAverageAPY } from 'src/utils/ghoUtilities';
import { roundToTokenDecimals } from 'src/utils/utils';

import { CapType } from '../../caps/helper';
import { AssetInput } from '../AssetInput';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import { TxSuccessView } from '../FlowCommons/Success';
import { DetailsHFLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
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
      mb={5}
      flexDirection="column"
      align="flex-start"
      captionColor="text.secondary"
    >
      <StyledTxModalToggleGroup
        color="primary"
        value={interestRateMode}
        exclusive
        onChange={(_, value) => setInterestRateMode(value)}
        sx={{ mt: 0.5 }}
      >
        <StyledTxModalToggleButton
          value={InterestRate.Variable}
          disabled={interestRateMode === InterestRate.Variable}
        >
          <Typography variant="buttonM" sx={{ mr: 1 }}>
            <Trans>Variable</Trans>
          </Typography>
          <FormattedNumber value={variableRate} percent variant="secondary14" />
        </StyledTxModalToggleButton>
        <StyledTxModalToggleButton
          value={InterestRate.Stable}
          disabled={interestRateMode === InterestRate.Stable}
        >
          <Typography variant="buttonM" sx={{ mr: 1 }}>
            <Trans>Stable</Trans>
          </Typography>
          <FormattedNumber value={stableRate} percent variant="secondary14" />
        </StyledTxModalToggleButton>
      </StyledTxModalToggleGroup>
    </Row>
  );
};

export const GhoBorrowModalContent = ({
  underlyingAsset,
  isWrongNetwork,
  poolReserve,
  userReserve,
  symbol,
}: ModalWrapperProps) => {
  const { mainTxState: borrowTxState, gasLimit, txError } = useModalContext();
  const { user, marketReferencePriceInUsd, ghoReserveData, ghoUserData, ghoLoadingData } =
    useAppDataContext();
  const { currentMarket } = useProtocolDataContext();
  const { borrowCap } = useAssetCaps();

  const { currentMarket: customMarket } = useProtocolDataContext();

  // Check if user has any open borrow positions on GHO
  // Check if user can borrow at a discount
  const hasGhoBorrowPositions = ghoUserData.userGhoBorrowBalance > 0;
  const userStakedAaveBalance: number = ghoUserData.userDiscountTokenBalance;
  const discountAvailable = userStakedAaveBalance > 0;

  const [interestRateMode, setInterestRateMode] = useState<InterestRate>(InterestRate.Variable);
  const [amount, setAmount] = useState('');
  const [riskCheckboxAccepted, setRiskCheckboxAccepted] = useState(false);

  // amount calculations
  let maxAmountToBorrow = getMaxGhoMintAmount(user);
  maxAmountToBorrow = Math.min(
    Number(maxAmountToBorrow),
    ghoReserveData.aaveFacilitatorRemainingCapacity
  ).toFixed(10);

  // We set this in a useEffect, so it doesn't constantly change when
  // max amount selected
  const handleChange = (_value: string) => {
    if (_value === '-1') {
      setAmount(maxAmountToBorrow);
    } else {
      const decimalTruncatedValue = roundToTokenDecimals(_value, poolReserve.decimals);
      setAmount(decimalTruncatedValue);
    }
  };

  const isMaxSelected = amount === maxAmountToBorrow;

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
  const displayRiskCheckbox =
    newHealthFactor.toNumber() < 1.5 && newHealthFactor.toString() !== '-1';

  // calculating input usd value
  const usdValue = valueToBigNumber(amount).multipliedBy(poolReserve.priceInUSD);

  const currentBorrowAPY = weightedAverageAPY(
    ghoReserveData.ghoVariableBorrowAPY,
    ghoUserData.userGhoBorrowBalance,
    ghoUserData.userGhoAvailableToBorrowAtDiscount,
    ghoReserveData.ghoBorrowAPYWithMaxDiscount
  );

  const futureBorrowAPY = weightedAverageAPY(
    ghoReserveData.ghoVariableBorrowAPY,
    ghoUserData.userGhoBorrowBalance + Number(amount),
    ghoUserData.userGhoAvailableToBorrowAtDiscount,
    ghoReserveData.ghoBorrowAPYWithMaxDiscount
  );
  console.log(
    `futureapy ${futureBorrowAPY} user gho balanace ${
      ghoUserData.userGhoBorrowBalance
    } amt ${amount} comb ${ghoUserData.userGhoBorrowBalance + Number(amount)} avail didc ${
      ghoUserData.userGhoAvailableToBorrowAtDiscount
    }`
  );
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
  } else if (!poolReserve.borrowingEnabled) {
    blockingError = ErrorType.BORROWING_NOT_AVAILABLE;
  }

  // error render handling
  const BlockingError = () => {
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
      case ErrorType.STABLE_RATE_NOT_ENABLED:
        return <Trans>The Stable Rate is not enabled for this currency</Trans>;
      default:
        return <></>;
    }
  };

  const BorrowAPY = () => {
    if (ghoLoadingData || (!hasGhoBorrowPositions && amount === '' && discountAvailable)) {
      return <NoData variant="secondary14" color="text.secondary" />;
    }

    type SharedIncentiveProps = Omit<GhoIncentivesCardProps, 'value' | 'borrowAmount'> & {
      'data-cy': string;
    };

    const sharedIncentiveProps: SharedIncentiveProps = {
      incentives: userReserve.reserve.vIncentivesData,
      symbol: userReserve.reserve.symbol,
      stkAaveBalance: ghoUserData.userDiscountTokenBalance || 0,
      ghoRoute:
        ROUTES.reserveOverview(userReserve.reserve.underlyingAsset, customMarket) + '/#discount',
      'data-cy': `apyType`,
    };

    if (!hasGhoBorrowPositions && amount !== '') {
      return (
        <GhoIncentivesCard
          withTokenIcon={discountAvailable}
          value={futureBorrowAPY}
          {...sharedIncentiveProps}
        />
      );
    }

    if (hasGhoBorrowPositions && amount === '') {
      return (
        <GhoIncentivesCard
          withTokenIcon={discountAvailable}
          value={currentBorrowAPY}
          onMoreDetailsClick={() => close()}
          {...sharedIncentiveProps}
        />
      );
    }

    if (!discountAvailable) {
      return (
        <GhoIncentivesCard
          value={currentBorrowAPY}
          onMoreDetailsClick={() => close()}
          {...sharedIncentiveProps}
        />
      );
    }

    if (discountAvailable) {
      return (
        <>
          <GhoIncentivesCard
            withTokenIcon
            value={currentBorrowAPY}
            onMoreDetailsClick={() => close()}
            {...sharedIncentiveProps}
          />
          {!!amount && (
            <>
              {hasGhoBorrowPositions && (
                <SvgIcon color="primary" sx={{ fontSize: '14px', mx: 1 }}>
                  <ArrowNarrowRightIcon />
                </SvgIcon>
              )}
              <GhoIncentivesCard
                value={ghoLoadingData ? -1 : futureBorrowAPY}
                {...sharedIncentiveProps}
              />
            </>
          )}
        </>
      );
    }

    return <NoData variant="secondary14" color="text.secondary" />;
  };

  // token info to add to wallet
  const addToken: ERC20TokenType = {
    address: underlyingAsset,
    symbol: poolReserve.iconSymbol,
    decimals: poolReserve.decimals,
  };

  const iconSymbol = poolReserve.iconSymbol;

  if (borrowTxState.success)
    return (
      <TxSuccessView
        action={<Trans>Borrowed</Trans>}
        amount={amount}
        symbol={iconSymbol}
        addToken={addToken}
      />
    );

  return (
    <>
      {borrowCap.determineWarningDisplay({ borrowCap })}

      {poolReserve.stableBorrowRateEnabled && (
        <BorrowModeSwitch
          interestRateMode={interestRateMode}
          setInterestRateMode={setInterestRateMode}
          variableRate={poolReserve.variableBorrowAPY}
          stableRate={poolReserve.stableBorrowAPY}
        />
      )}

      {!discountAvailable && !hasGhoBorrowPositions && (
        <Warning severity="info" sx={{ mb: 6 }}>
          <Typography variant="subheader1" gutterBottom>
            <Trans>GHO discount program</Trans>
          </Typography>
          <Typography variant="caption">
            <Trans>
              Safety Module participants (i.e., stkAAVE holders) receive{' '}
              <FormattedNumber
                value={ghoReserveData.ghoDiscountRate}
                percent
                visibleDecimals={0}
                variant="caption"
              />{' '}
              discount on the GHO borrow interest rate.{' '}
              <Link
                href={`/reserve-overview/?underlyingAsset=${underlyingAsset}&marketName=${currentMarket}`}
                underline="always"
              >
                Learn more
              </Link>
            </Trans>
          </Typography>
        </Warning>
      )}
      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={usdValue.toString(10)}
        assets={[
          {
            balance: maxAmountToBorrow,
            symbol,
            iconSymbol,
          },
        ]}
        symbol={symbol}
        capType={CapType.borrowCap}
        isMaxSelected={isMaxSelected}
        maxValue={maxAmountToBorrow}
        balanceText={<Trans>Available</Trans>}
      />

      {blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          <BlockingError />
        </Typography>
      )}

      <TxModalDetails gasLimit={gasLimit}>
        <DetailsHFLine
          visibleHfChange={!!amount}
          healthFactor={user.healthFactor}
          futureHealthFactor={newHealthFactor.toString(10)}
        />
        <Row
          caption={
            <Box>
              <FixedAPYTooltip
                text={<Trans>APY, fixed rate</Trans>}
                variant="subheader2"
                color="text.secondary"
              />
            </Box>
          }
          captionVariant="description"
          mb={4}
          align="flex-start"
        >
          <Box sx={{ textAlign: 'right' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <BorrowAPY />
            </Box>
          </Box>
        </Row>
        {discountAvailable && (
          <Typography variant="caption" color="text.secondary">
            <Trans>Discount applied for {userStakedAaveBalance} staking AAVE</Trans>
          </Typography>
        )}
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
        poolAddress={poolReserve.underlyingAsset}
        interestRateMode={interestRateMode}
        isWrongNetwork={isWrongNetwork}
        symbol={symbol}
        blocked={blockingError !== undefined || (displayRiskCheckbox && !riskCheckboxAccepted)}
        sx={displayRiskCheckbox ? { mt: 0 } : {}}
      />
    </>
  );
};
