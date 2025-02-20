import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Checkbox, Skeleton, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Warning } from 'src/components/primitives/Warning';
import { AssetInput } from 'src/components/transactions/AssetInput';
import { TxErrorView } from 'src/components/transactions/FlowCommons/Error';
import { GasEstimationError } from 'src/components/transactions/FlowCommons/GasEstimationError';
import { TxSuccessView } from 'src/components/transactions/FlowCommons/Success';
import {
  DetailsCooldownLine,
  DetailsHFLine,
  DetailsNumberLine,
  TxModalDetails,
} from 'src/components/transactions/FlowCommons/TxModalDetails';
import { CooldownWarning } from 'src/components/Warnings/CooldownWarning';
import {
  ComputedReserveData,
  ComputedUserReserveData,
  ExtendedFormattedUser,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { NetworkConfig } from 'src/ui-config/networksConfig';
import { calculateHFAfterWithdraw } from 'src/utils/hfUtils';
import { STAKE } from 'src/utils/mixPanelEvents';
import { roundToTokenDecimals } from 'src/utils/utils';

import { UmbrellaActions } from './UmbrellaActions';
import { usePreviewStake } from './hooks/usePreviewStake';
import { useShallow } from 'zustand/shallow';
import { stakeUmbrellaConfig } from 'src/services/UmbrellaStakeDataService';
import { Row } from 'src/components/primitives/Row';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';

export type StakeProps = {
  stakeData: MergedStakeData;
  icon: string;
  user: ExtendedFormattedUser;
  userReserve: ComputedUserReserveData;
  poolReserve: ComputedReserveData;
};
export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

export interface StakeInputAsset {
  symbol: string;
  iconSymbol: string;
  address: string;
  aToken?: boolean;
  balance: string;
}

const getInputTokens = (
  stakeData: MergedStakeData,
  networkConfig: NetworkConfig
): StakeInputAsset[] => {
  const assets = stakeData.underlyingIsStataToken
    ? [
        // stata token
        {
          address: stakeData.stataTokenData.asset,
          symbol: stakeData.stataTokenData.assetSymbol,
          iconSymbol: stakeData.stataTokenData.assetSymbol,
          balance: stakeData.formattedBalances.stataTokenAssetBalance,
        },
        {
          address: stakeData.stataTokenData.aToken,
          //  Note: using token symbol the same as underlying for aToken handling given we dont have tokens for "aBasSepUSDC"
          symbol: `a${stakeData.stataTokenData.assetSymbol}`,
          iconSymbol: stakeData.stataTokenData.assetSymbol,
          balance: stakeData.formattedBalances.aTokenBalanceAvailableToStake,
          aToken: true,
        },
      ]
    : [
        {
          address: stakeData.underlyingTokenAddress,
          symbol: stakeData.underlyingTokenSymbol,
          iconSymbol: stakeData.underlyingTokenSymbol,
          balance: stakeData.formattedBalances.underlyingTokenBalance,
        },
      ];
  if (stakeData.stataTokenData.isUnderlyingWrappedBaseToken) {
    assets.push({
      address: API_ETH_MOCK_ADDRESS,
      symbol: networkConfig.baseAssetSymbol,
      iconSymbol: networkConfig.baseAssetSymbol,
      balance: stakeData.formattedBalances.nativeTokenBalance,
    });
  }
  return assets;
};

export const UmbrellaModalContent = ({ stakeData, user, userReserve, poolReserve }: StakeProps) => {
  const { gasLimit, mainTxState: txState, txError } = useModalContext();
  const [riskCheckboxAccepted, setRiskCheckboxAccepted] = useState(false);

  // states
  const [_amount, setAmount] = useState('');

  const [currentChainId, currentNetworkConfig] = useRootStore(
    useShallow((store) => [store.currentChainId, store.currentNetworkConfig])
  );

  const assets = getInputTokens(stakeData, currentNetworkConfig);

  const [inputToken, setInputToken] = useState<StakeInputAsset>(assets[0]);

  const { data: stakeShares, isLoading: loadingPreviewStake } = usePreviewStake(
    _amount,
    stakeData.decimals,
    currentChainId,
    stakeData.tokenAddress,
    stakeData.underlyingIsStataToken ? stakeUmbrellaConfig[currentChainId].stakeGateway : ''
  );

  const underlyingBalance = valueToBigNumber(inputToken.balance || '0');

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? inputToken.balance : _amount;
  const stakingAToken = inputToken.aToken;

  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    if (maxSelected) {
      setAmount(inputToken.balance);
    } else {
      const decimalTruncatedValue = roundToTokenDecimals(value, stakeData.decimals);
      setAmount(decimalTruncatedValue);
    }
  };

  const { isWrongNetwork } = useIsWrongNetwork();

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  if (txState.success)
    return (
      <TxSuccessView action={<Trans>Staked</Trans>} amount={amount} symbol={inputToken.symbol} />
    );

  let healthFactorAfterStake = valueToBigNumber(1.6);
  if (stakingAToken) {
    // We use same function for checking HF as withdraw
    healthFactorAfterStake = calculateHFAfterWithdraw({
      user,
      userReserve,
      poolReserve,
      withdrawAmount: amount,
    });
  }

  const displayRiskCheckbox =
    healthFactorAfterStake.toNumber() >= 1 &&
    healthFactorAfterStake.toNumber() < 1.5 &&
    userReserve.usageAsCollateralEnabledOnUser;

  let displayBlockingStake = undefined;
  if (healthFactorAfterStake.lt('1') && user.totalBorrowsMarketReferenceCurrency !== '0') {
    displayBlockingStake = true;
  }

  const amountInUsd = valueToBigNumber(amount || '0')
    .multipliedBy(stakeData.price)
    .shiftedBy(-USD_DECIMALS)
    .toString();

  const stakeSharesUsd = valueToBigNumber(stakeShares || '0')
    .multipliedBy(stakeData.price)
    .shiftedBy(-USD_DECIMALS)
    .toString();

  return (
    <>
      <CooldownWarning cooldownSeconds={stakeData.cooldownSeconds} />

      <AssetInput
        value={amount}
        onChange={handleChange}
        onSelect={setInputToken}
        usdValue={amountInUsd}
        symbol={inputToken.symbol}
        assets={assets}
        isMaxSelected={isMaxSelected}
        maxValue={inputToken.balance}
        balanceText={<Trans>Wallet balance</Trans>}
      />

      {displayBlockingStake && (
        <Typography variant="helperText" color="error.main">
          <Trans>You can not stake this amount because it will cause collateral call</Trans>
        </Typography>
      )}
      <TxModalDetails gasLimit={gasLimit} chainId={currentChainId}>
        {stakingAToken && (
          <>
            <DetailsNumberLine
              description={<Trans>Remaining supply</Trans>}
              value={underlyingBalance.minus(amount || '0').toString(10)}
              symbol={inputToken.symbol}
            />
            <DetailsHFLine
              visibleHfChange={!!_amount}
              healthFactor={user ? user.healthFactor : '-1'}
              futureHealthFactor={healthFactorAfterStake.toString(10)}
            />
          </>
        )}
        <Row caption={<Trans>Stake token shares</Trans>} captionVariant="description" mb={4}>
          <Stack direction="column" alignItems="flex-end" justifyContent="center">
            {loadingPreviewStake ? (
              <Skeleton variant="rectangular" height={20} width={50} sx={{ borderRadius: '4px' }} />
            ) : (
              <>
                <FormattedNumber value={stakeShares || '0'} variant="secondary14" compact />
                <FormattedNumber
                  value={stakeSharesUsd}
                  color="text.secondary"
                  variant="helperText"
                  compact
                  symbol="USD"
                />
              </>
            )}
          </Stack>
        </Row>
        <DetailsCooldownLine cooldownSeconds={stakeData.cooldownSeconds} />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      {displayRiskCheckbox && (
        <>
          <Warning severity="error" sx={{ my: 6 }}>
            <Trans>
              Staking this amount will reduce your health factor and increase risk of liquidation.
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
              onChange={() => {
                setRiskCheckboxAccepted(!riskCheckboxAccepted);
              }}
              size="small"
            />
            <Typography variant="description">
              <Trans>I acknowledge the risks involved.</Trans>
            </Typography>
          </Box>
        </>
      )}

      <UmbrellaActions
        sx={{ mt: '48px' }}
        amountToStake={amount || '0'}
        isWrongNetwork={isWrongNetwork}
        symbol={''}
        blocked={
          displayBlockingStake !== undefined || (displayRiskCheckbox && !riskCheckboxAccepted)
        }
        selectedToken={inputToken}
        stakeData={stakeData}
        event={STAKE.STAKE_TOKEN}
        isMaxSelected={isMaxSelected}
      />
    </>
  );
};
