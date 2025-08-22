import { USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Checkbox, Skeleton, Stack, Typography } from '@mui/material';
import { parseUnits } from 'ethers/lib/utils';
import React, { useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { Warning } from 'src/components/primitives/Warning';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
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
import { ExtendedFormattedUser } from 'src/hooks/pool/useExtendedUserSummaryAndIncentives';
import { FormattedReservesAndIncentives } from 'src/hooks/pool/usePoolFormattedReserves';
import { FormattedUserReserves } from 'src/hooks/pool/useUserSummaryAndIncentives';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { STAKE } from 'src/utils/events';
import { calculateHFAfterWithdraw } from 'src/utils/hfUtils';
import { roundToTokenDecimals } from 'src/utils/utils';
import { useShallow } from 'zustand/shallow';

import { usePreviewStake } from './hooks/usePreviewStake';
import { UmbrellaActions } from './UmbrellaActions';

export type StakeProps = {
  stakeData: MergedStakeData;
  icon: string;
  user: ExtendedFormattedUser;
  userReserve: FormattedUserReserves;
  poolReserve: FormattedReservesAndIncentives;
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

const getInputTokens = (stakeData: MergedStakeData): StakeInputAsset[] => {
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
  assets.sort((a, b) => +b.balance - +a.balance);
  return assets;
};

export const UmbrellaModalContent = ({ stakeData, user, userReserve, poolReserve }: StakeProps) => {
  const { gasLimit, mainTxState: txState, txError } = useModalContext();

  const [riskCheckboxAccepted, setRiskCheckboxAccepted] = useState(false);
  const [_amount, setAmount] = useState('');

  const [currentChainId] = useRootStore(
    useShallow((store) => [store.currentChainId, store.currentNetworkConfig])
  );

  const assets = getInputTokens(stakeData);
  const [inputToken, setInputToken] = useState<StakeInputAsset>(assets[0]);

  const { data: stakeShares, isLoading: loadingPreviewStake } = usePreviewStake(
    parseUnits(_amount || '0', stakeData.decimals).toString(),
    stakeData.decimals,
    stakeData.underlyingIsStataToken ? stakeData.underlyingTokenAddress : '',
    currentChainId
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
    .multipliedBy(poolReserve.priceInUSD)
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
        {stakeData.underlyingIsStataToken && (
          <Row
            caption={
              <Stack direction="row" alignItems="center" gap={1}>
                <Trans>Stake token shares</Trans>
                <TextWithTooltip>
                  <Trans>
                    Staked tokens are wrapped and use an exchange rate. You may see fewer token
                    shares, but the value matches your deposit and will grow as yield accrues.
                  </Trans>
                </TextWithTooltip>
              </Stack>
            }
            captionVariant="description"
            mb={4}
            align="flex-start"
          >
            <Stack direction="column" alignItems="flex-end" justifyContent="center">
              {loadingPreviewStake ? (
                <Skeleton
                  variant="rectangular"
                  height={20}
                  width={50}
                  sx={{ borderRadius: '4px' }}
                />
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
        )}
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
        reserve={poolReserve}
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
