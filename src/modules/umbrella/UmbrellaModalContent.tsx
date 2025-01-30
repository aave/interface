import { ChainId } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Checkbox, Typography } from '@mui/material';
import React, { useRef, useState } from 'react';
import { Warning } from 'src/components/primitives/Warning';
import { AssetInput } from 'src/components/transactions/AssetInput';
import { TxErrorView } from 'src/components/transactions/FlowCommons/Error';
import { GasEstimationError } from 'src/components/transactions/FlowCommons/GasEstimationError';
import { TxSuccessView } from 'src/components/transactions/FlowCommons/Success';
import {
  DetailsCooldownLine,
  TxModalDetails,
} from 'src/components/transactions/FlowCommons/TxModalDetails';
import { TxModalTitle } from 'src/components/transactions/FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from 'src/components/transactions/Warnings/ChangeNetworkWarning';
import { CooldownWarning } from 'src/components/Warnings/CooldownWarning';
import {
  ComputedReserveData,
  ComputedUserReserveData,
  ExtendedFormattedUser,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { calculateHFAfterWithdraw } from 'src/utils/hfUtils';
import { STAKE } from 'src/utils/mixPanelEvents';

import { UmbrellaActions } from './UmbrellaActions';

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
  rawBalance: string;
}

const getInputTokens = (stakeData: MergedStakeData): StakeInputAsset[] => {
  return stakeData.underlyingIsWaToken
    ? [
        {
          address: stakeData.waTokenData.waTokenUnderlying,
          symbol: stakeData.waTokenData.waTokenUnderlyingSymbol,
          iconSymbol: stakeData.waTokenData.waTokenUnderlyingSymbol,
          balance: stakeData.formattedBalances.underlyingWaTokenBalance,
          rawBalance: stakeData.balances.underlyingWaTokenBalance,
        },
        {
          address: stakeData.waTokenData.waTokenAToken,
          //  Note: using token symbol the same as underlying for aToken handling given we dont have tokens for "aBasSepUSDC"
          symbol: stakeData.waTokenData.waTokenUnderlyingSymbol,
          iconSymbol: stakeData.waTokenData.waTokenUnderlyingSymbol,

          balance: stakeData.formattedBalances.underlyingWaTokenATokenBalance,
          rawBalance: stakeData.balances.underlyingWaTokenATokenBalance,
          aToken: true,
        },
      ]
    : [
        {
          // stata tokens
          address: stakeData.stakeTokenUnderlying,
          symbol: stakeData.stakeTokenSymbol,
          iconSymbol: stakeData.stakeTokenSymbol,
          balance: stakeData.formattedBalances.underlyingTokenBalance,
          rawBalance: stakeData.balances.underlyingTokenBalance,
        },
      ];
};

export const UmbrellaModalContent = ({ stakeData, user, userReserve, poolReserve }: StakeProps) => {
  const { readOnlyModeAddress } = useWeb3Context();
  const { gasLimit, mainTxState: txState, txError } = useModalContext();
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const [riskCheckboxAccepted, setRiskCheckboxAccepted] = useState(false);

  // states
  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>();

  const assets = getInputTokens(stakeData);

  const [inputToken, setInputToken] = useState<StakeInputAsset>(assets[0]);

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? inputToken.balance : _amount;

  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? inputToken.balance : value;
    setAmount(value);
  };

  const { isWrongNetwork, requiredChainId } = useIsWrongNetwork();

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  if (txState.success)
    return (
      <TxSuccessView action={<Trans>Staked</Trans>} amount={amountRef.current} symbol={'test'} />
    );

  let healthFactorAfterStake = valueToBigNumber(1.6);
  if (inputToken.aToken) {
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

  return (
    <>
      <TxModalTitle title="Stake" symbol={''} />

      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning
          networkName={currentNetworkConfig.name}
          chainId={requiredChainId}
          funnel={'Stake Modal'}
        />
      )}

      <CooldownWarning />

      <AssetInput
        value={amount}
        onChange={handleChange}
        onSelect={setInputToken}
        // usdValue={amountInUsd.toString()}
        usdValue="0"
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
      <TxModalDetails gasLimit={gasLimit} chainId={ChainId.mainnet}>
        {/* <DetailsNumberLine
          description={<Trans>Staking APR</Trans>}
          value={Number(stakeData?.stakeApy || '0') / 10000}
          percent
        /> */}
        <DetailsCooldownLine cooldownDays={+stakeData.cooldownSeconds} />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      {displayRiskCheckbox && (
        <>
          <Warning severity="error" sx={{ my: 6 }}>
            <Trans>
              Withdrawing this amount will reduce your health factor and increase risk of
              liquidation.
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
