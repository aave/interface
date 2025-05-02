import { normalize, normalizeBN } from '@aave/math-utils';
import { OrderStatus } from '@cowprotocol/cow-sdk';
import { SwitchVerticalIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, CircularProgress, IconButton, SvgIcon, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'src/components/primitives/Link';
import { Warning } from 'src/components/primitives/Warning';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { TokenInfoWithBalance } from 'src/hooks/generic/useTokensBalance';
import { useMultiProviderSwitchRates } from 'src/hooks/switch/useMultiProviderSwitchRates';
import { useSwitchProvider } from 'src/hooks/switch/useSwitchProvider';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { queryKeysFactory } from 'src/ui-config/queries';
import { TokenInfo } from 'src/ui-config/TokenList';
import { CustomMarket, getNetworkConfig, marketsData } from 'src/utils/marketsAndNetworksConfig';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { ParaswapErrorDisplay } from '../Warnings/ParaswapErrorDisplay';
import { supportedNetworksWithEnabledMarket, SupportedNetworkWithChainId } from './common';
import { getOrders } from './cowprotocol.helpers';
import { NetworkSelector } from './NetworkSelector';
import { SwitchProvider, SwitchRatesType } from './switch.types';
import { SwitchActions } from './SwitchActions';
import { SwitchAssetInput } from './SwitchAssetInput';
import { SwitchErrors } from './SwitchErrors';
import { SwitchRates } from './SwitchRates';
import { SwitchSlippageSelector } from './SwitchSlippageSelector';
import { SwitchTxSuccessView } from './SwitchTxSuccessView';
import { validateSlippage, ValidationSeverity } from './validation.helpers';

export type SwitchDetailsParams = Parameters<
  NonNullable<SwitchModalCustomizableProps['switchDetails']>
>[0];

export interface SwitchModalCustomizableProps {
  modalType: ModalType;
  switchDetails?: ({
    user,
    switchRates,
    gasLimit,
    selectedChainId,
    selectedOutputToken,
    selectedInputToken,
    safeSlippage,
    maxSlippage,
    switchProvider,
    ratesLoading,
    ratesError,
  }: {
    user: string;
    switchRates: SwitchRatesType;
    gasLimit: string;
    selectedChainId: number;
    selectedOutputToken: TokenInfoWithBalance;
    selectedInputToken: TokenInfoWithBalance;
    safeSlippage: number;
    maxSlippage: number;
    switchProvider?: SwitchProvider;
    ratesLoading: boolean;
    ratesError: Error | null;
  }) => React.ReactNode;
  inputBalanceTitle?: string;
  outputBalanceTitle?: string;
  tokensFrom?: TokenInfoWithBalance[];
  tokensTo?: TokenInfoWithBalance[];
  forcedDefaultInputToken?: TokenInfoWithBalance;
  forcedDefaultOutputToken?: TokenInfoWithBalance;
}

export const BaseSwitchModalContent = ({
  showSwitchInputAndOutputAssetsButton = true,
  showTitle = true,
  tokensFrom,
  tokensTo,
  defaultInputToken,
  defaultOutputToken,
  supportedNetworks,
  switchDetails,
  inputBalanceTitle,
  outputBalanceTitle,
  showChangeNetworkWarning = true,
}: {
  showTitle?: boolean;
  showSwitchInputAndOutputAssetsButton?: boolean;
  tokensFrom: TokenInfoWithBalance[];
  tokensTo: TokenInfoWithBalance[];
  defaultInputToken: TokenInfoWithBalance;
  defaultOutputToken: TokenInfoWithBalance;
  supportedNetworks: SupportedNetworkWithChainId[];
  selectedChainId: number;
  showChangeNetworkWarning?: boolean;
} & SwitchModalCustomizableProps) => {
  // State
  const [slippage, setSlippage] = useState('0.10');
  const [inputAmount, setInputAmount] = useState('');
  const [debounceInputAmount, setDebounceInputAmount] = useState('');
  const { mainTxState: switchTxState, gasLimit, txError, setTxError } = useModalContext();
  const user = useRootStore((store) => store.account);
  const [selectedInputToken, setSelectedInputToken] = useState(defaultInputToken);
  const [selectedOutputToken, setSelectedOutputToken] = useState(defaultOutputToken);
  const { readOnlyModeAddress } = useWeb3Context();
  const currentChainId = useRootStore((store) => store.currentChainId);
  const defaultNetwork = marketsData[CustomMarket.proto_mainnet_v3];
  const [selectedChainId, setSelectedChainId] = useState(() => {
    if (supportedNetworksWithEnabledMarket.find((elem) => elem.chainId === currentChainId))
      return currentChainId;
    return defaultNetwork.chainId;
  });
  const switchProvider = useSwitchProvider({ chainId: selectedChainId });

  const [cowSwitchsInProgress, setCowSwitchsInProgress] = useState(0);
  useEffect(() => {
    if (
      switchProvider == 'cowprotocol' &&
      user &&
      selectedChainId &&
      selectedInputToken &&
      selectedOutputToken
    ) {
      getOrders(selectedChainId, user).then((orders) => {
        setCowSwitchsInProgress(
          orders.filter(
            (order) =>
              order.sellToken.toLowerCase() == selectedInputToken.address.toLowerCase() &&
              order.buyToken.toLowerCase() == selectedOutputToken.address.toLowerCase() &&
              order.status == OrderStatus.OPEN
          ).length
        );
      });
    }
  }, [selectedInputToken, selectedOutputToken, switchProvider, selectedChainId, user]);

  // Ux Helpers
  const selectedNetworkConfig = getNetworkConfig(selectedChainId);
  const isWrongNetwork = useIsWrongNetwork(selectedChainId);
  const slippageValidation = validateSlippage(slippage);
  const safeSlippage =
    slippageValidation && slippageValidation.severity === ValidationSeverity.ERROR
      ? 0
      : Number(slippage) / 100;

  const debouncedInputChange = useMemo(() => {
    return debounce((value: string) => {
      setDebounceInputAmount(value);
    }, 300);
  }, [setDebounceInputAmount]);

  const handleInputChange = (value: string) => {
    setTxError(undefined);
    if (value === '-1') {
      setInputAmount(selectedInputToken.balance);
      debouncedInputChange(selectedInputToken.balance);
    } else {
      setInputAmount(value);
      debouncedInputChange(value);
    }
  };

  const handleSelectedInputToken = (token: TokenInfoWithBalance) => {
    if (!tokensFrom.find((t) => t.address === token.address)) {
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
    if (!tokensTo.find((t) => t.address === token.address)) {
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
  };

  const queryClient = useQueryClient();
  const addNewToken = async (token: TokenInfoWithBalance) => {
    queryClient.setQueryData<TokenInfoWithBalance[]>(
      queryKeysFactory.tokensBalance(tokensFrom, selectedChainId, user),
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
    srcToken: selectedInputToken.address,
    srcDecimals: selectedInputToken.decimals,
    destToken: selectedOutputToken.address,
    destDecimals: selectedOutputToken.decimals,
    user,
    options: {
      partner: 'aave-widget',
    },
    isTxSuccess: switchTxState.success,
  });

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
        provider={switchProvider ?? 'paraswap'}
        chainId={selectedChainId}
        outAmount={(
          Number(normalize(switchRates.destAmount, switchRates.destDecimals)) *
          (1 - safeSlippage)
        ).toString()}
      />
    );
  }

  const swapDetailsComponent =
    switchDetails && switchRates
      ? switchDetails({
          switchProvider,
          user,
          switchRates,
          gasLimit,
          selectedChainId,
          selectedOutputToken,
          selectedInputToken,
          safeSlippage,
          maxSlippage: Number(slippage),
          ratesLoading,
          ratesError,
        })
      : null;

  // Component
  return (
    <>
      {showTitle && (
        <TxModalTitle
          title={`Switch ${
            debounceInputAmount.length && selectedInputToken ? selectedInputToken.symbol : 'tokens'
          }`}
        />
      )}
      {showChangeNetworkWarning && isWrongNetwork.isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning
          networkName={selectedNetworkConfig.name}
          chainId={selectedChainId}
          event={{
            eventName: GENERAL.SWITCH_NETWORK,
          }}
        />
      )}

      {cowSwitchsInProgress > 0 && (
        <Warning severity="info" icon={false} sx={{ mt: 2, mb: 2 }}>
          <Typography variant="caption">
            You have {cowSwitchsInProgress} pending order{cowSwitchsInProgress > 1 ? 's' : ''} for
            this asset pair. You can track {cowSwitchsInProgress > 1 ? 'their' : 'its'} status in
            your{' '}
            <Link target="_blank" href="/history">
              transaction history
            </Link>
          </Typography>
        </Warning>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <NetworkSelector
          networks={supportedNetworks}
          selectedNetwork={selectedChainId}
          setSelectedNetwork={handleSelectedNetworkChange}
        />
        <SwitchSlippageSelector
          slippageValidation={slippageValidation}
          slippage={slippage}
          setSlippage={setSlippage}
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
              assets={tokensFrom.filter(
                (token) =>
                  token.address !== selectedOutputToken.address && Number(token.balance) !== 0
              )}
              value={inputAmount}
              onChange={handleInputChange}
              usdValue={switchRates?.srcUSD || '0'}
              onSelect={handleSelectedInputToken}
              selectedAsset={selectedInputToken}
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
              assets={tokensTo.filter((token) => token.address !== selectedInputToken.address)}
              value={
                switchRates
                  ? normalizeBN(switchRates.destAmount, switchRates.destDecimals).toString()
                  : '0'
              }
              usdValue={switchRates?.destUSD || '0'}
              loading={
                debounceInputAmount !== '0' &&
                debounceInputAmount !== '' &&
                ratesLoading &&
                !ratesError
              }
              onSelect={handleSelectedOutputToken}
              disableInput={true}
              selectedAsset={selectedOutputToken}
            />
          </Box>
          {switchRates && (
            <>
              <SwitchRates
                rates={switchRates}
                srcSymbol={selectedInputToken.symbol}
                destSymbol={selectedOutputToken.symbol}
              />
            </>
          )}

          {user ? (
            <>
              {(selectedInputToken.extensions?.isUserCustom ||
                selectedOutputToken.extensions?.isUserCustom) && (
                <Warning severity="warning" icon={false} sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="caption">
                    You have selected a custom imported token.
                  </Typography>
                </Warning>
              )}
              <SwitchErrors
                ratesError={ratesError}
                balance={selectedInputToken.balance}
                inputAmount={debounceInputAmount}
              />

              {swapDetailsComponent}

              {txError && <ParaswapErrorDisplay txError={txError} />}
              {switchProvider === 'cowprotocol' && (
                <Warning severity="info" icon={false} sx={{ mt: 4 }}>
                  <Typography variant="caption">
                    This action doesn&apos;t require gas as it&apos;s not an onchain transaction.
                  </Typography>
                </Warning>
              )}

              <SwitchActions
                isWrongNetwork={isWrongNetwork.isWrongNetwork}
                inputAmount={debounceInputAmount}
                inputToken={selectedInputToken.address}
                outputToken={selectedOutputToken.address}
                inputName={selectedInputToken.name}
                outputName={selectedOutputToken.name}
                slippage={safeSlippage.toString()}
                blocked={
                  !switchRates ||
                  Number(debounceInputAmount) > Number(selectedInputToken.balance) ||
                  !user ||
                  slippageValidation?.severity === ValidationSeverity.ERROR
                }
                chainId={selectedChainId}
                switchRates={switchRates}
              />
            </>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4, alignItems: 'center' }}>
              <Typography sx={{ mb: 6, textAlign: 'center' }} color="text.secondary">
                <Trans>Please connect your wallet to be able to switch your tokens.</Trans>
              </Typography>
              <ConnectWalletButton />
            </Box>
          )}
        </>
      )}
    </>
  );
};
