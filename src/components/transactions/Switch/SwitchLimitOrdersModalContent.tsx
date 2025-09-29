import { normalize } from '@aave/math-utils';
import { SupportedChainId, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/cow-sdk';
import { Box, CircularProgress } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { TokenInfoWithBalance, useTokensBalance } from 'src/hooks/generic/useTokensBalance';
import { useCowSwitchRates } from 'src/hooks/switch/useCowSwitchRates';
import { useGetConnectedWalletType } from 'src/hooks/useGetConnectedWalletType';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { useModalContext } from 'src/hooks/useModal';
import { StaticRate, useStaticRate } from 'src/hooks/useStaticRate';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { CustomMarket, marketsData } from 'src/ui-config/marketsConfig';
import { GENERAL } from 'src/utils/events';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { parseUnits } from 'viem';

import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { USDTResetWarning } from '../Warnings/USDTResetWarning';
import { getFilteredTokensForSwitch } from './BaseSwitchModal';
import { supportedNetworksWithEnabledMarketLimit } from './common';
import { isNativeToken } from './cowprotocol/cowprotocol.helpers';
import { Expiry, ExpirySelector } from './ExpirySelector';
import { NetworkSelector } from './NetworkSelector';
import { PriceInput } from './PriceInput';
import { SwitchAssetInput } from './SwitchAssetInput';
import { SwitchErrors } from './SwitchErrors';
import { SwitchLimitOrdersActions } from './SwitchLimitOrdersActions';
import { IntentTxDetails } from './SwitchModalTxDetails';
import { SwitchTxSuccessView } from './SwitchTxSuccessView';

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
  outputAmount: string;
  handleInputAmountChange: (value: string) => void;
  handleInputTokenChange: (token: TokenInfoWithBalance) => void;
  outputToken: TokenInfoWithBalance;
  handleOutputTokenChange: (token: TokenInfoWithBalance) => void;
  rate: string;
  handleRateChange: (value: string) => void;
  initialRate?: StaticRate;
  rateLoading: boolean;
  isInvertedRate: boolean;
  setIsInvertedRate: (isInverted: boolean) => void;
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
  isInvertedRate,
  setIsInvertedRate,
  outputAmount,
}: SwitchLimitOrdersInputsProps) => {
  const { isSmartContractWallet } = useGetConnectedWalletType();
  const maxInputAmount = isSmartContractWallet
    ? calculateMaxAmount(inputToken, chainId)
    : inputToken.balance;

  const rateUsd = isInvertedRate
    ? Number(rate) * Number(initialRate?.inputUsdPrice || '0')
    : Number(rate) * Number(initialRate?.outputUsdPrice || '0');

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
        rateUsd={rateUsd.toString()}
        onChangeRate={handleRateChange}
        originalRate={initialRate}
        isInvertedRate={isInvertedRate}
        setIsInvertedRate={setIsInvertedRate}
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

  const { mainTxState } = useModalContext();

  const userAddress = useRootStore((store) => store.account);

  const [expiry, setExpiry] = useState(Expiry['One week']);

  const [inputAmount, setInputAmount] = useState('');
  // const [outputAmount, setOutputAmount] = useState('');
  const [rate, setRate] = useState('');
  const [isInvertedRate, setIsInvertedRate] = useState(false);

  const [outputToken, setOutputToken] = useState(
    tokens.find((token) => token.symbol == 'GHO') || tokens[1]
  );
  const [showUSDTResetWarning, setShowUSDTResetWarning] = useState(false);

  const { data: staticRate, isLoading: staticRateLoading } = useStaticRate({
    chainId,
    inputToken,
    outputToken,
  });
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

  const outputAmount =
    inputAmount && rate
      ? isInvertedRate
        ? (Number(inputAmount) * (1 / Number(rate))).toString()
        : (Number(inputAmount) * Number(rate)).toString()
      : '';

  const isWrongNetwork = useIsWrongNetwork(chainId);
  const { isSmartContractWallet } = useGetConnectedWalletType();

  const showChangeNetworkWarning = isWrongNetwork.isWrongNetwork && !readOnlyModeAddress;
  const selectedNetworkConfig = getNetworkConfig(chainId);

  useEffect(() => {
    if (staticRate) {
      setRate(staticRate.rate);
    }
  }, [staticRate]);

  if (quote && mainTxState.success) {
    return (
      <SwitchTxSuccessView
        txHash={mainTxState.txHash}
        amount={normalize(quote.srcAmount, quote.srcDecimals).toString()}
        symbol={inputToken.symbol}
        iconSymbol={inputToken.symbol}
        iconUri={inputToken.logoURI}
        outSymbol={outputToken.symbol}
        outIconSymbol={outputToken.symbol}
        outIconUri={outputToken.logoURI}
        provider={'cowprotocol'}
        chainId={chainId}
        destDecimals={outputToken.decimals}
        srcDecimals={inputToken.decimals}
        outAmount={outputAmount}
      />
    );
  }

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
        rateLoading={staticRateLoading}
        initialRate={staticRate}
        isInvertedRate={isInvertedRate}
        setIsInvertedRate={setIsInvertedRate}
        outputAmount={outputAmount}
      />
      {quote && (
        <TxModalDetails showGasStation={false}>
          <IntentTxDetails
            selectedOutputToken={outputToken}
            selectedInputToken={inputToken}
            safeSlippage={0}
            networkFee={quote.amountAndCosts.costs.networkFee.amountInBuyCurrency.toString()}
            partnerFee={quote.amountAndCosts.costs.partnerFee.amount.toString()}
            outputAmount={parseUnits(outputAmount, outputToken.decimals).toString()}
            inputTokenPriceUsd={quote.srcTokenPriceUsd}
            outputTokenPriceUsd={quote.destTokenPriceUsd}
            inputAmount={quote.srcAmount}
          />
        </TxModalDetails>
      )}
      {showUSDTResetWarning && <USDTResetWarning />}
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
        outputAmount={outputAmount}
        isWrongNetwork={isWrongNetwork.isWrongNetwork}
        loading={quoteLoading}
        blocked={!!quoteError}
        expirationTime={expiry}
        setShowUSDTResetWarning={setShowUSDTResetWarning}
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
