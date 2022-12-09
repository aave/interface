import { API_ETH_MOCK_ADDRESS, InterestRate } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { APYTypeTooltip } from 'src/components/infoTooltips/APYTypeTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { Warning } from 'src/components/primitives/Warning';
import StyledToggleButton from 'src/components/StyledToggleButton';
import StyledToggleButtonGroup from 'src/components/StyledToggleButtonGroup';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

import { CapType } from '../../caps/helper';
import { AssetInput } from '../AssetInput';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import {
  DetailsIncentivesLine,
  DetailsUnwrapSwitch,
  TxModalDetails,
} from '../FlowCommons/TxModalDetails';
import { BorrowActions } from './BorrowActions';
import { BorrowModalContentSharedProps } from './BorrowModal';

type BorrowModalContentProps = ModalWrapperProps &
  BorrowModalContentSharedProps & {
    interestRateMode: InterestRate;
    onInterestRateModeChange: Dispatch<SetStateAction<InterestRate>>;
    unwrapped: boolean;
    setUnwrapped: (unwrapped: boolean) => void;
  };

export const BorrowModalContent = ({
  isWrongNetwork,
  poolReserve,
  symbol,
  amount,
  onAmountChange,
  maxAmountToBorrow,
  isMaxSelected,
  healthFactorComponent,
  riskCheckboxComponent,
  displayRiskCheckbox,
  riskCheckboxAccepted,
  error,
  errorComponent,
  interestRateMode,
  onInterestRateModeChange,
  unwrapped,
  setUnwrapped,
}: BorrowModalContentProps) => {
  const { gasLimit, txError } = useModalContext();
  const { currentNetworkConfig } = useProtocolDataContext();
  const { borrowCap, debtCeiling } = useAssetCaps();

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
        onChange={onAmountChange}
        usdValue={valueToBigNumber(amount).multipliedBy(poolReserve.priceInUSD).toString(10)}
        assets={[
          {
            balance: maxAmountToBorrow,
            symbol: symbol,
            iconSymbol:
              unwrapped && poolReserve.isWrappedBaseAsset
                ? currentNetworkConfig.baseAssetSymbol
                : poolReserve.iconSymbol,
          },
        ]}
        symbol={symbol}
        capType={CapType.borrowCap}
        isMaxSelected={isMaxSelected}
        maxValue={maxAmountToBorrow}
        balanceText={<Trans>Available</Trans>}
      />
      {error !== undefined && errorComponent}
      {poolReserve.stableBorrowRateEnabled && (
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
            onChange={(_, value) => onInterestRateModeChange(value)}
            sx={{ width: '100%', mt: 0.5 }}
          >
            <StyledToggleButton
              value={InterestRate.Variable}
              disabled={interestRateMode === InterestRate.Variable}
            >
              <Typography variant="subheader1" sx={{ mr: 1 }}>
                <Trans>Variable</Trans>
              </Typography>
              <FormattedNumber
                value={poolReserve.variableBorrowAPY}
                percent
                variant="secondary14"
              />
            </StyledToggleButton>
            <StyledToggleButton
              value={InterestRate.Stable}
              disabled={interestRateMode === InterestRate.Stable}
            >
              <Typography variant="subheader1" sx={{ mr: 1 }}>
                <Trans>Stable</Trans>
              </Typography>
              <FormattedNumber value={poolReserve.stableBorrowAPY} percent variant="secondary14" />
            </StyledToggleButton>
          </StyledToggleButtonGroup>
        </Row>
      )}
      <TxModalDetails gasLimit={gasLimit}>
        {poolReserve.isWrappedBaseAsset && (
          <DetailsUnwrapSwitch
            unwrapped={unwrapped}
            setUnWrapped={setUnwrapped}
            symbol={poolReserve.symbol}
            unwrappedSymbol={currentNetworkConfig.baseAssetSymbol}
          />
        )}
        <DetailsIncentivesLine incentives={incentive} symbol={poolReserve.symbol} />
        {healthFactorComponent}
      </TxModalDetails>
      {txError && <GasEstimationError txError={txError} />}
      {displayRiskCheckbox && riskCheckboxComponent}
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
          unwrapped && poolReserve.isWrappedBaseAsset
            ? API_ETH_MOCK_ADDRESS
            : poolReserve.underlyingAsset
        }
        interestRateMode={interestRateMode}
        isWrongNetwork={isWrongNetwork}
        symbol={symbol}
        blocked={error !== undefined || (displayRiskCheckbox && !riskCheckboxAccepted)}
        sx={displayRiskCheckbox ? { mt: 0 } : {}}
      />
    </>
  );
};
