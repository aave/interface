import { normalize } from '@aave/math-utils';
import { SupportedChainId, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/cow-sdk';
import { Box, CircularProgress } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { TokenInfoWithBalance, useTokensBalance } from 'src/hooks/generic/useTokensBalance';
import { useCowSwitchRates } from 'src/hooks/switch/useCowSwitchRates';
import { useGetConnectedWalletType } from 'src/hooks/useGetConnectedWalletType';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { ModalType } from 'src/hooks/useModal';
import { StaticRate, useStaticRate } from 'src/hooks/useStaticRate';
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
import { Expiry, ExpirySelector } from './ExpirySelector';
import { NetworkSelector } from './NetworkSelector';
import { PriceInput } from './PriceInput';
import { SwitchAssetInput } from './SwitchAssetInput';
import { SwitchErrors } from './SwitchErrors';
import { SwitchLimitOrdersActions } from './SwitchLimitOrdersActions';
import { SwitchModalTxDetails } from './SwitchModalTxDetails';

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
  initialRate?: StaticRate;
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
  const { isSmartContractWallet } = useGetConnectedWalletType();
  const maxInputAmount = isSmartContractWallet
    ? calculateMaxAmount(inputToken, chainId)
    : inputToken.balance;

  const outputAmount = Number(inputAmount) * Number(rate);

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
          (token) => token.address !== outputToken.address && !token.extensions?.isNative
        )}
        value={inputAmount}
        onChange={handleInputAmountChange}
        usdValue={(Number(initialRate?.inputUsdPrice) * Number(inputAmount)).toString() || '0'}
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
            )
        )}
        value={outputAmount.toString()}
        usdValue={(Number(initialRate?.outputUsdPrice) * Number(outputAmount)).toString() || '0'}
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
        switchRate={console.log}
        onChangeRate={handleRateChange}
        originalRate={initialRate}
      />
    </Box>
  );
};

interface SwitchLimitOrdersInnerProps {
  tokens: TokenInfoWithBalance[];
  chainId: number;
  setChainId: (chainId: number) => void;
}

export const SwitchLimitOrdersInner = ({
  tokens,
  chainId,
  setChainId,
}: SwitchLimitOrdersInnerProps) => {
  const { readOnlyModeAddress } = useWeb3Context();

  const [inputToken, setInputToken] = useState(
    tokens.find(
      (token) => token.balance !== '0' && !token.extensions?.isNative && token.symbol !== 'GHO'
    ) || tokens[0]
  );

  const { user } = useAppDataContext();
  const userAddress = useRootStore((store) => store.account);

  const [expiry, setExpiry] = useState(Expiry['One week']);

  const [inputAmount, setInputAmount] = useState('');
  // const [outputAmount, setOutputAmount] = useState('');
  const [rate, setRate] = useState('');

  const [outputToken, setOutputToken] = useState(
    tokens.find((token) => token.symbol == 'GHO') || tokens[1]
  );

  const { data: staticRate } = useStaticRate({ chainId, inputToken, outputToken });
  const {
    data: quote,
    isLoading: quoteLoading,
    error: quoteError,
  } = useCowSwitchRates({
    chainId,
    amount: inputAmount ? parseUnits(inputAmount, inputToken.decimals).toString() : '0',
    srcUnderlyingToken: inputToken.address,
    destUnderlyingToken: outputToken.address,
    user: userAddress,
    inputSymbol: inputToken.symbol,
    isInputTokenCustom: !!inputToken.extensions?.isCustom,
    isOutputTokenCustom: !!outputToken.extensions?.isCustom,
    outputSymbol: outputToken.symbol,
    srcDecimals: inputToken.decimals,
    destDecimals: outputToken.decimals,
    isTxSuccess: false,
  });

  const isWrongNetwork = useIsWrongNetwork(chainId);
  const { isSmartContractWallet } = useGetConnectedWalletType();

  const showChangeNetworkWarning = isWrongNetwork.isWrongNetwork && !readOnlyModeAddress;
  const selectedNetworkConfig = getNetworkConfig(chainId);

  useEffect(() => {
    if (staticRate) {
      setRate(staticRate.rate);
    }
  }, [staticRate]);

  return (
    <>
      {showChangeNetworkWarning && (
        <ChangeNetworkWarning
          autoSwitchOnMount={true}
          networkName={selectedNetworkConfig.name}
          chainId={chainId}
          event={{
            eventName: GENERAL.SWITCH_NETWORK,
          }}
          askManualSwitch={isSmartContractWallet}
        />
      )}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <NetworkSelector
          networks={supportedNetworksWithEnabledMarketLimit}
          selectedNetwork={chainId}
          setSelectedNetwork={setChainId}
        />
        <ExpirySelector selectedExpiry={expiry} setSelectedExpiry={setExpiry} />
      </Box>
      <SwitchLimitOrdersInputs
        chainId={chainId}
        tokens={tokens}
        inputToken={inputToken}
        inputAmount={inputAmount}
        handleInputAmountChange={setInputAmount}
        handleInputTokenChange={setInputToken}
        outputToken={outputToken}
        handleOutputTokenChange={setOutputToken}
        rate={rate || '0'}
        handleRateChange={setRate}
        rateLoading={false}
        initialRate={staticRate}
      />
      <SwitchModalTxDetails
        switchRates={quote}
        selectedOutputToken={outputToken}
        safeSlippage={0}
        gasLimit="0"
        selectedChainId={chainId}
        customReceivedTitle={'Min received'}
        reserves={[]}
        selectedInputToken={inputToken}
        loading={quoteLoading}
        modalType={ModalType.SwitchLimitOrder}
        showGasStation={false}
        user={user}
      />
      <SwitchErrors
        ratesError={quoteError}
        balance={inputToken.balance}
        inputAmount={inputAmount}
      />
      <SwitchLimitOrdersActions
        chainId={chainId}
        inputToken={inputToken}
        inputAmount={inputAmount}
        outputToken={outputToken}
        // setIsExecutingActions={setIsExecutingActions}
        outputAmount={inputAmount && rate ? (Number(inputAmount) * Number(rate)).toString() : ''}
        // setShowGasStation={setShowGasStation}
        isWrongNetwork={isWrongNetwork.isWrongNetwork}
        loading={quoteLoading}
        blocked={!!quoteError}
      />
    </>
  );
};

export const SwitchLimitOrdersModalContent = () => {
  const dashboardChainId = useRootStore((store) => store.currentChainId);
  const user = useRootStore((store) => store.account);

  const [selectedChainId, setSelectedChainId] = useState(() => {
    if (supportedNetworksWithEnabledMarketLimit.find((elem) => elem.chainId === dashboardChainId))
      return dashboardChainId;
    return defaultNetwork.chainId;
  });
  const tokens = useMemo(() => getFilteredTokensForSwitch(selectedChainId), [selectedChainId]);

  const { data: tokensWithBalance } = useTokensBalance(tokens, selectedChainId, user);
  if (!tokensWithBalance) {
    return (
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', my: '60px' }}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <SwitchLimitOrdersInner
      tokens={tokensWithBalance}
      chainId={selectedChainId}
      setChainId={setSelectedChainId}
    />
  );
};
