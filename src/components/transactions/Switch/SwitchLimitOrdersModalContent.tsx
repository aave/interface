import { normalize } from '@aave/math-utils';
import { SupportedChainId, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/cow-sdk';
import { Box, CircularProgress } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { TokenInfoWithBalance, useTokensBalance } from 'src/hooks/generic/useTokensBalance';
import { useGetConnectedWalletType } from 'src/hooks/useGetConnectedWalletType';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { useStaticRate } from 'src/hooks/useStaticRate';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { CustomMarket, marketsData } from 'src/ui-config/marketsConfig';
import { GENERAL } from 'src/utils/events';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { parseUnits } from 'viem';

import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { getFilteredTokensForSwitch } from './BaseSwitchModal';
import { supportedNetworksWithEnabledMarketLimit } from './common';
import { isNativeToken } from './cowprotocol/cowprotocol.helpers';
import { NetworkSelector } from './NetworkSelector';
import { PriceInput } from './PriceInput';
import { CowProtocolRatesType } from './switch.types';
import { SwitchAssetInput } from './SwitchAssetInput';
import { SwitchLimitOrdersActions } from './SwitchLimitOrdersActions';

const calculateMaxAmount = (token: TokenInfoWithBalance, chainId: number) => {
  const nativeDecimals = 18;
  const gasRequiredForEthFlow =
    chainId === 1 ? parseUnits('0.01', nativeDecimals) : parseUnits('0.0001', nativeDecimals); // TODO: Ask for better value coming from the SDK
  const requiredAssetsLeftForGas = isNativeToken(token.address) ? gasRequiredForEthFlow : BigInt(0);
  const balance = parseUnits(token.balance || '0', nativeDecimals);
  const maxAmount =
    balance > requiredAssetsLeftForGas ? balance - requiredAssetsLeftForGas : balance;
  return normalize(maxAmount.toString(), nativeDecimals).toString();
};

const defaultNetwork = marketsData[CustomMarket.proto_mainnet_v3];

interface SwitchLimitOrdersInputsProps {
  chainId: number;
  tokens: TokenInfoWithBalance[];
  inputToken: TokenInfoWithBalance;
  inputAmount: string;
  handleInputAmountChange: (value: string) => void;
  handleInputTokenChange: (token: TokenInfoWithBalance) => void;
  outputToken: TokenInfoWithBalance;
  handleOutputTokenChange: (token: TokenInfoWithBalance) => void;
  rate: string;
  handleRateChange: (value: string) => void;
  initialRate?: CowProtocolRatesType;
  rateLoading: boolean;
}

export const SwitchLimitOrdersInputs = ({
  chainId,
  tokens,
  inputToken,
  inputAmount,
  handleInputAmountChange,
  handleInputTokenChange,
  outputToken,
  handleOutputTokenChange,
  rate,
  handleRateChange,
  initialRate,
  rateLoading,
}: SwitchLimitOrdersInputsProps) => {
  const { isSmartContractWallet, isSafeWallet } = useGetConnectedWalletType();
  const maxInputAmount = isSmartContractWallet
    ? calculateMaxAmount(inputToken, chainId)
    : inputToken.balance;

  const outputAmount = Number(inputAmount) / Number(rate);

  return (
    <Box
      sx={{
        display: 'flex',
        gap: '15px',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <SwitchAssetInput
        chainId={chainId}
        balanceTitle={'from'}
        assets={tokens.filter(
          (token) =>
            token.address !== outputToken.address &&
            Number(token.balance) !== 0 &&
            // Remove native tokens for non-Safe smart contract wallets
            !(isSmartContractWallet && !isSafeWallet && token.extensions?.isNative) &&
            // Avoid wrapping
            !(
              isNativeToken(outputToken.address) &&
              token.address.toLowerCase() ===
                WRAPPED_NATIVE_CURRENCIES[chainId as SupportedChainId]?.address.toLowerCase()
            ) &&
            !(
              outputToken.address.toLowerCase() ===
                WRAPPED_NATIVE_CURRENCIES[chainId as SupportedChainId]?.address.toLowerCase() &&
              isNativeToken(token.address)
            )
        )}
        value={inputAmount}
        onChange={handleInputAmountChange}
        usdValue={initialRate?.srcUSD || '0'}
        onSelect={handleInputTokenChange}
        selectedAsset={inputToken}
        forcedMaxValue={maxInputAmount}
        allowCustomTokens={true}
      />
      <SwitchAssetInput
        chainId={chainId}
        balanceTitle={'to'}
        assets={tokens.filter(
          (token) =>
            token.address !== inputToken.address &&
            // Avoid wrapping
            !(
              isNativeToken(inputToken.address) &&
              token.address.toLowerCase() ===
                WRAPPED_NATIVE_CURRENCIES[chainId as SupportedChainId]?.address.toLowerCase()
            ) &&
            !(
              inputToken.address.toLowerCase() ===
                WRAPPED_NATIVE_CURRENCIES[chainId as SupportedChainId]?.address.toLowerCase() &&
              isNativeToken(token.address)
            )
        )}
        value={outputAmount.toString()}
        usdValue={initialRate?.destSpotInUsd || '0'}
        loading={rateLoading}
        onSelect={handleOutputTokenChange}
        disableInput={true}
        selectedAsset={outputToken}
        showBalance={false}
        allowCustomTokens={true}
      />
      <PriceInput
        originAsset={inputToken}
        targetAsset={outputToken}
        loading={rateLoading}
        rate={rate}
        rateUsd={'0'}
        switchRate={() => {}}
        onChangeRate={handleRateChange}
      />
    </Box>
  );
};

export const SwitchLimitOrdersModalContent = () => {
  const { readOnlyModeAddress } = useWeb3Context();

  const dashboardChainId = useRootStore((store) => store.currentChainId);
  const user = useRootStore((store) => store.account);

  const [selectedChainId, setSelectedChainId] = useState(() => {
    if (supportedNetworksWithEnabledMarketLimit.find((elem) => elem.chainId === dashboardChainId))
      return dashboardChainId;
    return defaultNetwork.chainId;
  });

  const tokens = useMemo(() => getFilteredTokensForSwitch(selectedChainId), [selectedChainId]);
  const [inputToken, setInputToken] = useState(
    tokens.find(
      (token) => (token.balance !== '0' || token.extensions?.isNative) && token.symbol !== 'GHO'
    ) || tokens[0]
  );

  const [inputAmount, setInputAmount] = useState('');
  // const [outputAmount, setOutputAmount] = useState('');
  const [rate, setRate] = useState('');

  const [outputToken, setOutputToken] = useState(
    tokens.find((token) => token.symbol == 'GHO') || tokens[1]
  );

  const { data: tokensWithBalance } = useTokensBalance(tokens, selectedChainId, user);

  const { data: staticRate } = useStaticRate({ chainId: selectedChainId, inputToken, outputToken });

  const isWrongNetwork = useIsWrongNetwork(selectedChainId);
  const { isSmartContractWallet } = useGetConnectedWalletType();

  const showChangeNetworkWarning = isWrongNetwork.isWrongNetwork && !readOnlyModeAddress;
  const selectedNetworkConfig = getNetworkConfig(selectedChainId);

  useEffect(() => {
    if (staticRate) {
      setRate(staticRate.rate);
    }
  }, [staticRate]);

  if (!tokensWithBalance) {
    return (
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', my: '60px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {showChangeNetworkWarning && (
        <ChangeNetworkWarning
          autoSwitchOnMount={true}
          networkName={selectedNetworkConfig.name}
          chainId={selectedChainId}
          event={{
            eventName: GENERAL.SWITCH_NETWORK,
          }}
          askManualSwitch={isSmartContractWallet}
        />
      )}
      <NetworkSelector
        networks={supportedNetworksWithEnabledMarketLimit}
        selectedNetwork={selectedChainId}
        setSelectedNetwork={setSelectedChainId}
      />
      <SwitchLimitOrdersInputs
        chainId={selectedChainId}
        tokens={tokensWithBalance || []}
        inputToken={inputToken}
        inputAmount={inputAmount}
        handleInputAmountChange={setInputAmount}
        handleInputTokenChange={setInputToken}
        outputToken={outputToken}
        handleOutputTokenChange={setOutputToken}
        rate={rate || '0'}
        handleRateChange={setRate}
        rateLoading={false}
      />
      <SwitchLimitOrdersActions
        chainId={selectedChainId}
        inputToken={inputToken}
        inputAmount={inputAmount}
        outputToken={outputToken}
        // isMaxSelected={isMaxSelected}
        // setIsExecutingActions={setIsExecutingActions}
        outputAmount={inputAmount && rate ? (Number(inputAmount) / Number(rate)).toString() : ''}
        // setShowGasStation={setShowGasStation}
        // poolReserve={poolReserve}
        // targetReserve={targetReserve}
        isWrongNetwork={isWrongNetwork.isWrongNetwork}
        blocked={false}
      />
    </>
  );
};
