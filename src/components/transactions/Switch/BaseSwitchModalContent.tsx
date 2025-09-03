import { normalize, normalizeBN, valueToBigNumber } from '@aave/math-utils';
import { OrderStatus, SupportedChainId, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/cow-sdk';
import { SwitchVerticalIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Checkbox, CircularProgress, IconButton, SvgIcon, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { Link } from 'src/components/primitives/Link';
import { Warning } from 'src/components/primitives/Warning';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { TokenInfoWithBalance } from 'src/hooks/generic/useTokensBalance';
import { useMultiProviderSwitchRates } from 'src/hooks/switch/useMultiProviderSwitchRates';
import { useGetConnectedWalletType } from 'src/hooks/useGetConnectedWalletType';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { findByChainId } from 'src/ui-config/marketsConfig';
import { queryKeysFactory } from 'src/ui-config/queries';
import { TokenInfo } from 'src/ui-config/TokenList';
import { GENERAL } from 'src/utils/events';
import { calculateHFAfterSwap } from 'src/utils/hfUtils';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { parseUnits } from 'viem';

import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { ParaswapErrorDisplay } from '../Warnings/ParaswapErrorDisplay';
import { SupportedNetworkWithChainId } from './common';
import { getOrders, isNativeToken } from './cowprotocol/cowprotocol.helpers';
import { NetworkSelector } from './NetworkSelector';
import { isCowProtocolRates } from './switch.types';
import { SwitchActions } from './SwitchActions';
import { SwitchAssetInput } from './SwitchAssetInput';
import { SwitchErrors } from './SwitchErrors';
import { SwitchModalTxDetails } from './SwitchModalTxDetails';
import { SwitchRates } from './SwitchRates';
import { SwitchSlippageSelector } from './SwitchSlippageSelector';
import { SwitchTxSuccessView } from './SwitchTxSuccessView';
import { validateSlippage, ValidationSeverity } from './validation.helpers';

const valueLostPercentage = (destValueInUsd: number, srcValueInUsd: number) => {
  if (destValueInUsd === 0) return 1;
  if (srcValueInUsd === 0) return 0;

  const receivingPercentage = destValueInUsd / srcValueInUsd;
  const valueLostPercentage = receivingPercentage ? 1 - receivingPercentage : 0;
  return valueLostPercentage;
};

const shouldShowWarning = (lostValue: number, srcValueInUsd: number) => {
  if (srcValueInUsd > 500000) return lostValue > 0.03;
  if (srcValueInUsd > 100000) return lostValue > 0.04;
  if (srcValueInUsd > 10000) return lostValue > 0.05;
  if (srcValueInUsd > 1000) return lostValue > 0.07;

  return lostValue > 0.05;
};

const shouldRequireConfirmation = (lostValue: number) => {
  return lostValue > 0.2;
};

export interface SwitchModalCustomizableProps {
  modalType: ModalType;
  inputBalanceTitle?: string;
  outputBalanceTitle?: string;
  tokensFrom?: TokenInfoWithBalance[];
  tokensTo?: TokenInfoWithBalance[];
  forcedDefaultInputToken?: TokenInfoWithBalance;
  forcedDefaultOutputToken?: TokenInfoWithBalance;
  showSwitchInputAndOutputAssetsButton?: boolean;
  forcedChainId?: number;
}

export const BaseSwitchModalContent = ({
  showSwitchInputAndOutputAssetsButton = true,
  showTitle = true,
  forcedDefaultInputToken,
  forcedDefaultOutputToken,
  supportedNetworks,
  inputBalanceTitle,
  outputBalanceTitle,
  initialFromTokens,
  initialToTokens,
  tokensLoading = false,
  showChangeNetworkWarning = true,
  modalType,
  selectedChainId,
  setSelectedChainId,
  refetchInitialTokens,
}: {
  showTitle?: boolean;
  forcedChainId: number;
  showSwitchInputAndOutputAssetsButton?: boolean;
  forcedDefaultInputToken?: TokenInfoWithBalance;
  initialFromTokens: TokenInfoWithBalance[];
  initialToTokens: TokenInfoWithBalance[];
  tokensLoading?: boolean;
  forcedDefaultOutputToken?: TokenInfoWithBalance;
  supportedNetworks: SupportedNetworkWithChainId[];
  showChangeNetworkWarning?: boolean;
  modalType: ModalType;
  selectedChainId: number;
  setSelectedChainId: (chainId: number) => void;
  refetchInitialTokens: () => void;
} & SwitchModalCustomizableProps) => {
  // State
  const [inputAmount, setInputAmount] = useState('');
  const [debounceInputAmount, setDebounceInputAmount] = useState('');
  const { mainTxState: switchTxState, gasLimit, txError, setTxError, close } = useModalContext();
  const user = useRootStore((store) => store.account);
  const { readOnlyModeAddress } = useWeb3Context();
  const trackEvent = useRootStore((store) => store.trackEvent);
  const [showUSDTResetWarning, setShowUSDTResetWarning] = useState(false);
  const [highPriceImpactConfirmed, setHighPriceImpactConfirmed] = useState(false);
  const selectedNetworkConfig = getNetworkConfig(selectedChainId);
  const isWrongNetwork = useIsWrongNetwork(selectedChainId);
  const [isSwapFlowSelected, setIsSwapFlowSelected] = useState(false);
  const [isExecutingActions, setIsExecutingActions] = useState(false);

  const { defaultInputToken, defaultOutputToken } = useMemo(() => {
    let auxInputToken = forcedDefaultInputToken;
    let auxOutputToken = forcedDefaultOutputToken;

    const fromList = initialFromTokens;
    const toList = initialToTokens;

    if (!auxInputToken) {
      auxInputToken = fromList.find(
        (token) => (token.balance !== '0' || token.extensions?.isNative) && token.symbol !== 'GHO'
      );
    }

    if (!auxOutputToken) {
      auxOutputToken = toList.find((token) => token.symbol == 'GHO');
    }

    return {
      defaultInputToken: auxInputToken ?? fromList[0],
      defaultOutputToken: auxOutputToken ?? toList[1],
    };
  }, [initialFromTokens, initialToTokens]);

  const [selectedInputToken, setSelectedInputToken] = useState<TokenInfoWithBalance>(
    forcedDefaultInputToken ?? defaultInputToken
  );
  const [selectedOutputToken, setSelectedOutputToken] = useState<TokenInfoWithBalance>(
    forcedDefaultOutputToken ?? defaultOutputToken
  );

  const { isSmartContractWallet, isSafeWallet } = useGetConnectedWalletType();

  const debouncedInputChange = useMemo(() => {
    return debounce((value: string) => {
      setDebounceInputAmount(value);
    }, 300);
  }, [setDebounceInputAmount]);

  const handleInputChange = (value: string) => {
    setTxError(undefined);
    setHighPriceImpactConfirmed(false);
    if (value === '-1') {
      // Max Selected
      setInputAmount(selectedInputToken.balance);
      debouncedInputChange(selectedInputToken.balance);
    } else {
      setInputAmount(value);
      debouncedInputChange(value);
    }
  };

  const handleSelectedInputToken = (token: TokenInfoWithBalance) => {
    if (!initialFromTokens?.find((t) => t.address === token.address)) {
      addNewToken(token).then(() => {
        setSelectedInputToken(token);
        setTxError(undefined);
      });
    } else {
      setSelectedInputToken(token);
      setTxError(undefined);
    }
  };

  const handleSelectedOutputToken = (token: TokenInfoWithBalance) => {
    if (!initialToTokens?.find((t) => t.address === token.address)) {
      addNewToken(token).then(() => {
        setSelectedOutputToken(token);
        setTxError(undefined);
      });
    } else {
      setSelectedOutputToken(token);
      setTxError(undefined);
    }
  };

  const onSwitchReserves = () => {
    const fromToken = selectedInputToken;
    const toToken = selectedOutputToken;
    const toInput = switchRates
      ? normalizeBN(switchRates.destAmount, switchRates.destDecimals).toString()
      : '0';
    setSelectedInputToken(toToken);
    setSelectedOutputToken(fromToken);
    setInputAmount(toInput);
    setDebounceInputAmount(toInput);
    setTxError(undefined);
  };

  const handleSelectedNetworkChange = (value: number) => {
    setTxError(undefined);
    setSelectedChainId(value);
    // Reset input amount when changing networks
    setInputAmount('');
    setDebounceInputAmount('');
    refetchInitialTokens();
  };

  const queryClient = useQueryClient();
  const addNewToken = async (token: TokenInfoWithBalance) => {
    queryClient.setQueryData<TokenInfoWithBalance[]>(
      queryKeysFactory.tokensBalance(
        initialFromTokens.concat(initialToTokens) ?? [],
        selectedChainId,
        user
      ),
      (oldData) => {
        if (oldData)
          return [...oldData, token].sort((a, b) => Number(b.balance) - Number(a.balance));
        return [token];
      }
    );
    const customTokens = localStorage.getItem('customTokens');
    const newTokenInfo = {
      address: token.address,
      symbol: token.symbol,
      decimals: token.decimals,
      chainId: token.chainId,
      name: token.name,
      logoURI: token.logoURI,
      extensions: {
        isUserCustom: true,
      },
    };
    if (customTokens) {
      const parsedCustomTokens: TokenInfo[] = JSON.parse(customTokens);
      parsedCustomTokens.push(newTokenInfo);
      localStorage.setItem('customTokens', JSON.stringify(parsedCustomTokens));
    } else {
      localStorage.setItem('customTokens', JSON.stringify([newTokenInfo]));
    }
  };
  // Update selected tokens when defaults change (e.g., after network change)
  useEffect(() => {
    if (
      !forcedDefaultInputToken &&
      defaultInputToken &&
      selectedInputToken?.chainId !== selectedChainId
    ) {
      setSelectedInputToken(defaultInputToken);
    }
    if (
      !forcedDefaultOutputToken &&
      defaultOutputToken &&
      selectedOutputToken?.chainId !== selectedChainId
    ) {
      setSelectedOutputToken(defaultOutputToken);
    }
  }, [
    defaultInputToken,
    defaultOutputToken,
    selectedChainId,
    forcedDefaultInputToken,
    forcedDefaultOutputToken,
    selectedInputToken?.chainId,
    selectedOutputToken?.chainId,
  ]);

  // User and reserves (for HF and flashloan decision)
  const { user: extendedUser, reserves } = useAppDataContext();
  const targetReserve = useMemo(
    () =>
      reserves.find(
        (r) => r.underlyingAsset.toLowerCase() === selectedOutputToken?.address.toLowerCase()
      ),
    [reserves, selectedOutputToken]
  );
  const userReserve = useMemo(
    () =>
      extendedUser?.userReservesData.find(
        (ur) => ur.underlyingAsset.toLowerCase() === selectedInputToken?.address.toLowerCase()
      ),
    [extendedUser, selectedInputToken]
  );
  const poolReserve = userReserve?.reserve;

  const [shouldUseFlashloan, setShouldUseFlashloan] = useState<boolean | undefined>(undefined);

  // Data
  const {
    data: switchRates,
    error: ratesError,
    isFetching: ratesLoading,
  } = useMultiProviderSwitchRates({
    chainId: selectedChainId,
    amount:
      debounceInputAmount === ''
        ? '0'
        : normalizeBN(debounceInputAmount, -1 * selectedInputToken.decimals).toFixed(0),
    srcUnderlyingToken: selectedInputToken?.address,
    srcAToken: selectedInputToken?.aToken,
    srcDecimals: selectedInputToken?.decimals,
    destUnderlyingToken: selectedOutputToken?.address,
    destAToken: selectedOutputToken?.aToken,
    destDecimals: selectedOutputToken?.decimals,
    inputSymbol: selectedInputToken?.symbol,
    outputSymbol: selectedOutputToken?.symbol,
    isInputTokenCustom: !!selectedInputToken?.extensions?.isUserCustom,
    isOutputTokenCustom: !!selectedOutputToken?.extensions?.isUserCustom,
    user,
    options: {
      partner: 'aave-widget',
    },
    modalType,
    isTxSuccess: switchTxState.success,
    shouldUseFlashloan,
    isExecutingActions,
  });

  const [slippage, setSlippage] = useState(switchRates?.provider == 'cowprotocol' ? '0.5' : '0.10');
  const [showGasStation, setShowGasStation] = useState(switchRates?.provider == 'paraswap');

  const slippageValidation = validateSlippage(
    slippage,
    selectedChainId,
    isNativeToken(selectedInputToken?.address),
    switchRates?.provider
  );

  const safeSlippage =
    slippageValidation && slippageValidation.severity === ValidationSeverity.ERROR
      ? 0
      : Number(slippage) / 100;

  useEffect(() => {
    if (ratesError) {
      console.error('tracking error', ratesError);
      trackEvent('Swap Error', {
        'Error Message': ratesError.message,
        'Error Name': ratesError.name,
        'Error Stack': ratesError.stack,
        'Input Token': selectedInputToken.symbol,
        'Output Token': selectedOutputToken.symbol,
        'Input Amount': debounceInputAmount,
        'Output Amount': normalizeBN(
          switchRates?.provider === 'cowprotocol'
            ? switchRates?.destSpot
            : switchRates?.destAmount || 0,
          switchRates?.destDecimals || 18
        ).toString(),
        'Input Amount USD': switchRates?.srcUSD,
        'Output Amount USD': switchRates?.destUSD,
        Slippage: safeSlippage,
      });
    }
  }, [ratesError]);

  useEffect(() => {
    if (txError && txError.actionBlocked) {
      console.error('tracking error', txError);
      trackEvent('Swap Tx Error', {
        'Error Message': txError.error?.toString(),
        'Error Raw': txError.rawError?.toString(),
        'Error Action': txError.txAction,
        'Input Token': selectedInputToken.symbol,
        'Output Token': selectedOutputToken.symbol,
        'Input Amount': debounceInputAmount,
        'Output Amount': normalizeBN(
          switchRates?.provider === 'cowprotocol'
            ? switchRates?.destSpot
            : switchRates?.destAmount || 0,
          switchRates?.destDecimals || 18
        ).toString(),
        'Input Amount USD': switchRates?.srcUSD,
        'Output Amount USD': switchRates?.destUSD,
        Slippage: safeSlippage,
      });
    }
  }, [txError]);

  // Compute HF effect of withdrawing inputAmount (copied from SwitchModalTxDetails)
  const { hfEffectOfFromAmount, hfAfterSwap } = useMemo(() => {
    try {
      if (!poolReserve || !userReserve || !extendedUser || !switchRates || !targetReserve)
        return { hfEffectOfFromAmount: '0' };

      // Amounts in human units (mirror SwitchModalTxDetails: intent uses destSpot, market uses destAmount)
      const fromAmount = normalizeBN(switchRates.srcAmount, switchRates.srcDecimals).toString();
      const toAmountRaw = normalizeBN(
        switchRates.provider === 'cowprotocol' ? switchRates.destSpot : switchRates.destAmount,
        switchRates.destDecimals
      ).toString();
      const toAmountAfterSlippage = valueToBigNumber(toAmountRaw)
        .multipliedBy(1 - safeSlippage)
        .toString();

      const { hfEffectOfFromAmount, hfAfterSwap } = calculateHFAfterSwap({
        fromAmount,
        fromAssetData: poolReserve,
        fromAssetUserData: userReserve,
        user: extendedUser,
        toAmountAfterSlippage: toAmountAfterSlippage,
        toAssetData: targetReserve,
      });

      return {
        hfEffectOfFromAmount: hfEffectOfFromAmount.toString(),
        hfAfterSwap: hfAfterSwap.toString(),
      };
    } catch {
      return { hfEffectOfFromAmount: '0', hfAfterSwap: undefined };
    }
  }, [
    poolReserve,
    userReserve,
    extendedUser,
    inputAmount,
    targetReserve,
    switchRates,
    safeSlippage,
  ]);

  const isHFLow = useMemo(() => {
    if (!hfAfterSwap) return false;

    const hfNumber = new BigNumber(hfAfterSwap);

    if (hfNumber.lt(0)) return false;

    return hfNumber.lt(1.05);
  }, [hfAfterSwap]);

  const shouldUseFlashloanFn = (healthFactor: string, hfEffectOfFromAmount: string) => {
    return (
      healthFactor !== '-1' &&
      new BigNumber(healthFactor).minus(new BigNumber(hfEffectOfFromAmount)).lt('1.05')
    );
  };

  useEffect(() => {
    const shouldUseFlashloanValue = shouldUseFlashloanFn(
      poolReserve && userReserve && extendedUser ? extendedUser?.healthFactor ?? '-1' : '-1',
      poolReserve && userReserve && extendedUser ? hfEffectOfFromAmount ?? '0' : '0'
    );

    if (modalType !== ModalType.CollateralSwap) {
      setIsSwapFlowSelected(true);
    } else if (!ratesLoading && !!switchRates?.provider) {
      if (shouldUseFlashloanValue === shouldUseFlashloan) {
        return;
      }

      setShouldUseFlashloan(shouldUseFlashloanValue);
      setIsSwapFlowSelected(true);
    }
  }, [modalType, switchRates, ratesLoading, shouldUseFlashloan]);

  // Define default slippage for CoW
  useEffect(() => {
    if (switchRates?.provider == 'cowprotocol' && isCowProtocolRates(switchRates)) {
      setSlippage(switchRates.suggestedSlippage.toString());
    } else if (modalType === ModalType.CollateralSwap && shouldUseFlashloan === true) {
      setSlippage('0.5');
    }
  }, [switchRates, shouldUseFlashloan, modalType]);

  const [showSlippageWarning, setShowSlippageWarning] = useState(false);
  useEffect(() => {
    // Debounce to avoid race condition
    const timeout = setTimeout(() => {
      setShowSlippageWarning(
        isCowProtocolRates(switchRates) && Number(slippage) < switchRates?.suggestedSlippage
      );
    }, 500);
    return () => clearTimeout(timeout);
  }, [slippage, switchRates]);

  const [cowOpenOrdersTotalAmountFormatted, setCowOpenOrdersTotalAmountFormatted] = useState<
    string | undefined
  >(undefined);
  useEffect(() => {
    if (
      switchRates?.provider == 'cowprotocol' &&
      user &&
      selectedChainId &&
      selectedInputToken &&
      selectedOutputToken
    ) {
      setCowOpenOrdersTotalAmountFormatted(undefined);

      getOrders(selectedChainId, user).then((orders) => {
        const token =
          modalType === ModalType.CollateralSwap
            ? selectedInputToken.aToken
            : selectedOutputToken.aToken;

        if (!token) {
          return;
        }

        const cowOpenOrdersTotalAmount = orders
          .filter(
            (order) =>
              order.sellToken.toLowerCase() == token.toLowerCase() &&
              order.status == OrderStatus.OPEN
          )
          .map((order) => order.sellAmount)
          .reduce((acc, curr) => acc + Number(curr), 0);
        if (cowOpenOrdersTotalAmount > 0) {
          setCowOpenOrdersTotalAmountFormatted(
            normalize(cowOpenOrdersTotalAmount, selectedInputToken.decimals).toString()
          );
        } else {
          setCowOpenOrdersTotalAmountFormatted(undefined);
        }
      });
    } else {
      setCowOpenOrdersTotalAmountFormatted(undefined);
    }
  }, [
    selectedInputToken,
    selectedOutputToken,
    switchRates?.provider,
    selectedChainId,
    user,
    modalType,
  ]);

  // Views
  if (!initialFromTokens && !initialToTokens) {
    return (
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', my: '60px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (tokensLoading) {
    return (
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', my: '60px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // No tokens found
  if (
    (initialFromTokens !== undefined && initialFromTokens.length === 0) ||
    (initialToTokens !== undefined && initialToTokens.length === 0)
  ) {
    return (
      <BasicModal open setOpen={() => close()}>
        <Typography color="text.secondary">
          <Trans>No eligible assets to swap.</Trans>
        </Typography>
      </BasicModal>
    );
  }

  // Success View
  if (switchRates && switchTxState.success) {
    return (
      <SwitchTxSuccessView
        txHash={switchTxState.txHash}
        amount={normalize(switchRates.srcAmount, switchRates.srcDecimals).toString()}
        symbol={selectedInputToken.symbol}
        iconSymbol={selectedInputToken.symbol}
        iconUri={selectedInputToken.logoURI}
        outSymbol={selectedOutputToken.symbol}
        outIconSymbol={selectedOutputToken.symbol}
        outIconUri={selectedOutputToken.logoURI}
        provider={switchRates?.provider ?? 'paraswap'}
        chainId={selectedChainId}
        destDecimals={selectedOutputToken.decimals}
        srcDecimals={selectedInputToken.decimals}
        outAmount={normalizeBN(switchRates.destAmount, switchRates.destDecimals)
          .multipliedBy(1 - safeSlippage)
          .decimalPlaces(switchRates.destDecimals, BigNumber.ROUND_UP)
          .toString()}
      />
    );
  }

  // Eth-Flow requires to leave some assets for gas
  const nativeDecimals = 18;
  const gasRequiredForEthFlow =
    selectedChainId === 1
      ? parseUnits('0.01', nativeDecimals)
      : parseUnits('0.0001', nativeDecimals); // TODO: Ask for better value coming from the SDK
  const requiredAssetsLeftForGas =
    isNativeToken(selectedInputToken?.address) &&
    !isSmartContractWallet &&
    modalType === ModalType.Switch
      ? gasRequiredForEthFlow
      : undefined;
  const maxAmount = (() => {
    const balance = parseUnits(selectedInputToken?.balance || '0', nativeDecimals);
    if (!requiredAssetsLeftForGas) return balance;
    return balance > requiredAssetsLeftForGas ? balance - requiredAssetsLeftForGas : balance;
  })();
  const maxAmountFormatted = maxAmount
    ? normalize(maxAmount.toString(), nativeDecimals).toString()
    : undefined;

  const lostValue = switchRates
    ? valueLostPercentage(
        Number(switchRates?.destUSD) * (1 - safeSlippage),
        Number(switchRates?.srcUSD)
      )
    : 0;

  const showWarning = switchRates
    ? shouldShowWarning(lostValue, Number(switchRates?.srcUSD))
    : false;
  const requireConfirmation = switchRates ? shouldRequireConfirmation(lostValue) : false;

  // Component
  return (
    <>
      {showTitle && (
        <TxModalTitle
          title={`Swap ${selectedInputToken ? selectedInputToken.symbol : 'Assets'} ${
            modalType === ModalType.CollateralSwap ? 'supply' : ''
          }`}
        />
      )}
      {showChangeNetworkWarning && isWrongNetwork.isWrongNetwork && !readOnlyModeAddress && (
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

      {cowOpenOrdersTotalAmountFormatted && (
        <Warning severity="info" icon={false} sx={{ mt: 2, mb: 2 }}>
          <Typography variant="caption">
            You have open orders for {cowOpenOrdersTotalAmountFormatted} {selectedInputToken.symbol}
            . <br /> Track them in your{' '}
            <Link
              target="_blank"
              href={`/history?marketName=${findByChainId(selectedChainId)?.market}`}
            >
              transaction history
            </Link>
          </Typography>
        </Warning>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: modalType === ModalType.CollateralSwap ? 'flex-end' : 'space-between',
          alignItems: 'center',
        }}
      >
        {modalType !== ModalType.CollateralSwap && (
          <NetworkSelector
            networks={supportedNetworks}
            selectedNetwork={selectedChainId}
            setSelectedNetwork={handleSelectedNetworkChange}
          />
        )}
        <SwitchSlippageSelector
          slippageValidation={slippageValidation}
          slippage={slippage}
          setSlippage={setSlippage}
          suggestedSlippage={
            switchRates?.provider === 'cowprotocol'
              ? switchRates?.suggestedSlippage.toString()
              : undefined
          }
        />
      </Box>
      {!selectedInputToken || !selectedOutputToken ? (
        <CircularProgress />
      ) : (
        <>
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
              chainId={selectedChainId}
              balanceTitle={inputBalanceTitle}
              assets={initialFromTokens.filter(
                (token) =>
                  token.address !== selectedOutputToken.address &&
                  Number(token.balance) !== 0 &&
                  // Remove native tokens for non-Safe smart contract wallets
                  !(isSmartContractWallet && !isSafeWallet && token.extensions?.isNative) &&
                  // Avoid wrapping
                  !(
                    isNativeToken(selectedOutputToken.address) &&
                    token.address.toLowerCase() ===
                      WRAPPED_NATIVE_CURRENCIES[
                        selectedChainId as SupportedChainId
                      ]?.address.toLowerCase()
                  ) &&
                  !(
                    selectedOutputToken.address.toLowerCase() ===
                      WRAPPED_NATIVE_CURRENCIES[
                        selectedChainId as SupportedChainId
                      ]?.address.toLowerCase() && isNativeToken(token.address)
                  )
              )}
              value={inputAmount}
              onChange={handleInputChange}
              usdValue={switchRates?.srcUSD || '0'}
              onSelect={handleSelectedInputToken}
              selectedAsset={selectedInputToken}
              forcedMaxValue={maxAmountFormatted}
              allowCustomTokens={modalType !== ModalType.CollateralSwap}
            />
            {showSwitchInputAndOutputAssetsButton && (
              <IconButton
                onClick={onSwitchReserves}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  position: 'absolute',
                  backgroundColor: 'background.paper',
                  '&:hover': { backgroundColor: 'background.surface' },
                }}
              >
                <SvgIcon
                  sx={{
                    color: 'primary.main',
                    fontSize: '18px',
                  }}
                >
                  <SwitchVerticalIcon />
                </SvgIcon>
              </IconButton>
            )}
            <SwitchAssetInput
              chainId={selectedChainId}
              balanceTitle={outputBalanceTitle}
              assets={initialToTokens.filter(
                (token) =>
                  token.address !== selectedInputToken.address &&
                  // Avoid wrapping
                  !(
                    isNativeToken(selectedInputToken.address) &&
                    token.address.toLowerCase() ===
                      WRAPPED_NATIVE_CURRENCIES[
                        selectedChainId as SupportedChainId
                      ]?.address.toLowerCase()
                  ) &&
                  !(
                    selectedInputToken.address.toLowerCase() ===
                      WRAPPED_NATIVE_CURRENCIES[
                        selectedChainId as SupportedChainId
                      ]?.address.toLowerCase() && isNativeToken(token.address)
                  )
              )}
              value={normalizeBN(
                switchRates?.provider === 'cowprotocol'
                  ? switchRates?.destSpot
                  : switchRates?.destAmount || 0,
                switchRates?.destDecimals || 18
              ).toString()}
              usdValue={
                switchRates?.provider === 'cowprotocol'
                  ? switchRates?.destSpotInUsd
                  : switchRates?.destUSD || '0'
              }
              loading={
                debounceInputAmount !== '0' &&
                debounceInputAmount !== '' &&
                ratesLoading &&
                !ratesError
              }
              onSelect={handleSelectedOutputToken}
              disableInput={true}
              selectedAsset={selectedOutputToken}
              showBalance={false}
              allowCustomTokens={modalType !== ModalType.CollateralSwap}
            />
          </Box>

          {switchRates && isSwapFlowSelected && (
            <>
              <SwitchRates
                rates={switchRates}
                srcSymbol={selectedInputToken.symbol}
                destSymbol={selectedOutputToken.symbol}
                showPriceImpact={!isCowProtocolRates(switchRates)}
              />
            </>
          )}

          {(selectedInputToken.extensions?.isUserCustom ||
            selectedOutputToken.extensions?.isUserCustom) && (
            <Warning severity="warning" icon={false} sx={{ mt: 2, mb: 2 }}>
              <Typography variant="caption">
                You selected a custom imported token. Make sure it&apos;s the right token.
              </Typography>
            </Warning>
          )}
          {isSwapFlowSelected && extendedUser && switchRates && (
            <SwitchModalTxDetails
              switchRates={switchRates}
              user={extendedUser}
              selectedOutputToken={selectedOutputToken}
              selectedInputToken={selectedInputToken}
              safeSlippage={safeSlippage}
              gasLimit={gasLimit}
              selectedChainId={selectedChainId}
              showGasStation={showGasStation}
              reserves={reserves}
              modalType={modalType}
              customReceivedTitle={
                modalType === ModalType.CollateralSwap ? (
                  <Trans>Minimum new collateral</Trans>
                ) : undefined
              }
            />
          )}

          {showSlippageWarning && (
            <Warning severity="warning" icon={false} sx={{ mt: 5 }}>
              <Typography variant="caption">
                Slippage is lower than recommended. The swap may be delayed or fail.
              </Typography>
            </Warning>
          )}

          {showUSDTResetWarning && (
            <Warning severity="info" sx={{ mt: 5 }}>
              <Typography variant="caption">
                <Trans>
                  USDT on Ethereum requires approval reset before a new approval. This will require
                  an additional transaction.
                </Trans>
              </Typography>
            </Warning>
          )}

          {modalType === ModalType.CollateralSwap && isHFLow && (
            <Warning severity="error" icon={false} sx={{ mt: 5 }}>
              <Typography variant="caption">
                <Trans>
                  Low health factor after swap. Please select a different asset or lower the amount.
                </Trans>
              </Typography>
            </Warning>
          )}

          <SwitchErrors
            ratesError={ratesError}
            balance={selectedInputToken.balance}
            inputAmount={debounceInputAmount}
            sx={{ mb: !isSwapFlowSelected ? 0 : 4 }}
          />

          {txError && <ParaswapErrorDisplay txError={txError} />}

          {showWarning && isSwapFlowSelected && (
            <Warning
              severity="warning"
              icon={false}
              sx={{
                mt: 2,
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography variant="caption">
                <Trans>High price impact. This route may return less due to low liquidity.</Trans>
              </Typography>
              {requireConfirmation && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    mt: 2,
                  }}
                >
                  <Typography variant="caption">
                    <Trans>
                      I confirm the swap with a potential {(lostValue * 100).toFixed(0)}% value loss
                    </Trans>
                  </Typography>
                  <Checkbox
                    checked={highPriceImpactConfirmed}
                    onChange={() => {
                      setHighPriceImpactConfirmed(!highPriceImpactConfirmed);
                    }}
                    size="small"
                    data-cy={'high-price-impact-checkbox'}
                  />
                </Box>
              )}
            </Warning>
          )}

          {isSwapFlowSelected && (
            <SwitchActions
              isWrongNetwork={isWrongNetwork.isWrongNetwork}
              inputAmount={debounceInputAmount}
              inputToken={
                modalType === ModalType.CollateralSwap && shouldUseFlashloan === true
                  ? selectedInputToken.address
                  : modalType === ModalType.CollateralSwap
                  ? selectedInputToken.aToken ?? selectedInputToken.address
                  : selectedInputToken.address
              }
              outputToken={
                modalType === ModalType.CollateralSwap && shouldUseFlashloan === true
                  ? selectedOutputToken.address
                  : modalType === ModalType.CollateralSwap
                  ? selectedOutputToken.aToken ?? selectedOutputToken.address
                  : selectedOutputToken.address
              }
              loading={ratesLoading || !isSwapFlowSelected}
              setShowUSDTResetWarning={setShowUSDTResetWarning}
              inputSymbol={selectedInputToken.symbol}
              outputSymbol={selectedOutputToken.symbol}
              slippage={safeSlippage.toString()}
              setShowGasStation={setShowGasStation}
              useFlashloan={shouldUseFlashloan === true}
              poolReserve={poolReserve}
              targetReserve={targetReserve}
              isMaxSelected={inputAmount === selectedInputToken.balance}
              blocked={
                !switchRates ||
                Number(debounceInputAmount) > Number(selectedInputToken.balance) ||
                !user ||
                slippageValidation?.severity === ValidationSeverity.ERROR ||
                (requireConfirmation && !highPriceImpactConfirmed) ||
                (shouldUseFlashloan === true && !!poolReserve && !poolReserve.flashLoanEnabled) ||
                (modalType === ModalType.CollateralSwap && isHFLow)
              }
              chainId={selectedChainId}
              switchRates={switchRates}
              modalType={modalType}
              setIsExecutingActions={setIsExecutingActions}
            />
          )}
        </>
      )}
    </>
  );
};
