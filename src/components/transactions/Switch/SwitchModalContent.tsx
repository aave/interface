import { normalize, normalizeBN } from '@aave/math-utils';
import { AaveV3Ethereum } from '@bgd-labs/aave-address-book';
import { SwitchVerticalIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, CircularProgress, IconButton, SvgIcon, Typography } from '@mui/material';
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { useParaswapSellRates } from 'src/hooks/paraswap/useParaswapRates';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getNetworkConfig, NetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { ParaswapErrorDisplay } from '../Warnings/ParaswapErrorDisplay';
import { SupportedNetworkWithChainId } from './common';
import { NetworkSelector } from './NetworkSelector';
import { SwitchActions } from './SwitchActions';
import { SwitchAssetInput } from './SwitchAssetInput';
import { SwitchErrors } from './SwitchErrors';
import { TokenInfoWithBalance } from './SwitchModal';
import { SwitchRates } from './SwitchRates';
import { SwitchSlippageSelector } from './SwitchSlippageSelector';
import { SwitchTxSuccessView } from './SwitchTxSuccessView';

interface SwitchModalContentProps {
  selectedChainId: number;
  setSelectedChainId: (value: number) => void;
  supportedNetworks: SupportedNetworkWithChainId[];
  tokens: TokenInfoWithBalance[];
  selectedNetworkConfig: NetworkConfig;
  defaultAsset?: string;
}

const GHO_TOKEN_ADDRESS = AaveV3Ethereum.ASSETS.GHO.UNDERLYING;

export const SwitchModalContent = ({
  supportedNetworks,
  selectedChainId,
  setSelectedChainId,
  tokens,
  selectedNetworkConfig,
}: // defaultAsset,
SwitchModalContentProps) => {
  const [slippage, setSlippage] = useState('0.001');
  const [inputAmount, setInputAmount] = useState('');
  const [debounceInputAmount, setDebounceInputAmount] = useState('');
  const { mainTxState: switchTxState, gasLimit, txError, setTxError } = useModalContext();
  const user = useRootStore((store) => store.account);

  const getDefaultToken = () => {
    if (tokens[0].address === GHO_TOKEN_ADDRESS) {
      return tokens[1];
    }
    return tokens[0];
  };

  const getDefaultOutputToken = () => {
    const gho = tokens.find((token) => token.address === GHO_TOKEN_ADDRESS);
    const aave = tokens.find((token) => token.symbol == 'AAVE');
    if (gho) return gho;
    if (aave) return aave;
    return tokens[1];
  };

  const [selectedInputToken, setSelectedInputToken] = useState(() => getDefaultToken());
  const [selectedOutputToken, setSelectedOutputToken] = useState(() => getDefaultOutputToken());

  useEffect(() => {
    setSelectedInputToken(getDefaultToken());
    setSelectedOutputToken(getDefaultOutputToken());
  }, [tokens]);

  const { readOnlyMode } = useWeb3Context();

  const isWrongNetwork = useIsWrongNetwork(selectedChainId);

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

  const debouncedInputChange = useMemo(() => {
    return debounce((value: string) => {
      setDebounceInputAmount(value);
    }, 300);
  }, [setDebounceInputAmount]);

  const {
    data: sellRates,
    error: ratesError,
    isFetching: ratesLoading,
  } = useParaswapSellRates({
    chainId: selectedNetworkConfig.underlyingChainId ?? selectedChainId,
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
  });

  if (sellRates && switchTxState.success) {
    return (
      <SwitchTxSuccessView
        txHash={switchTxState.txHash}
        amount={debounceInputAmount}
        symbol={selectedInputToken.symbol}
        iconSymbol={selectedInputToken.symbol}
        iconUri={selectedInputToken.logoURI}
        outSymbol={selectedOutputToken.symbol}
        outIconSymbol={selectedOutputToken.symbol}
        outIconUri={selectedOutputToken.logoURI}
        outAmount={(
          Number(normalize(sellRates.destAmount, sellRates.destDecimals)) *
          (1 - Number(slippage))
        ).toString()}
      />
    );
  }

  const onSwitchReserves = () => {
    const fromToken = selectedInputToken;
    const toToken = selectedOutputToken;
    const toInput = sellRates
      ? normalizeBN(sellRates.destAmount, sellRates.destDecimals).toString()
      : '0';
    setSelectedInputToken(toToken);
    setSelectedOutputToken(fromToken);
    setInputAmount(toInput);
    setDebounceInputAmount(toInput);
    setTxError(undefined);
  };

  const handleSelectedInputToken = (token: TokenInfoWithBalance) => {
    setTxError(undefined);
    setSelectedInputToken(token);
  };

  const handleSelectedOutputToken = (token: TokenInfoWithBalance) => {
    setTxError(undefined);
    setSelectedOutputToken(token);
  };

  const handleSelectedNetworkChange = (value: number) => {
    setTxError(undefined);
    setSelectedChainId(value);
  };

  return (
    <>
      <TxModalTitle title="Switch tokens" />
      {isWrongNetwork.isWrongNetwork && !readOnlyMode && (
        <ChangeNetworkWarning
          networkName={getNetworkConfig(selectedChainId).name}
          chainId={selectedChainId}
          event={{
            eventName: GENERAL.SWITCH_NETWORK,
          }}
        />
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <NetworkSelector
          networks={supportedNetworks}
          selectedNetwork={selectedChainId}
          setSelectedNetwork={handleSelectedNetworkChange}
        />
        <SwitchSlippageSelector slippage={slippage} setSlippage={setSlippage} />
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
              assets={tokens.filter((token) => token.address !== selectedOutputToken.address)}
              value={inputAmount}
              onChange={handleInputChange}
              usdValue={sellRates?.srcUSD || '0'}
              symbol={selectedInputToken.symbol}
              onSelect={handleSelectedInputToken}
              inputTitle={' '}
              sx={{ width: '100%' }}
            />
            <IconButton
              onClick={onSwitchReserves}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                position: 'absolute',
                backgroundColor: 'background.paper',
              }}
            >
              <SvgIcon sx={{ color: 'primary.main', fontSize: '18px' }}>
                <SwitchVerticalIcon />
              </SvgIcon>
            </IconButton>
            <SwitchAssetInput
              assets={tokens.filter((token) => token.address !== selectedInputToken.address)}
              value={
                sellRates
                  ? normalizeBN(sellRates.destAmount, sellRates.destDecimals).toString()
                  : '0'
              }
              usdValue={sellRates?.destUSD || '0'}
              symbol={selectedOutputToken.symbol}
              loading={
                debounceInputAmount !== '0' &&
                debounceInputAmount !== '' &&
                ratesLoading &&
                !ratesError
              }
              onSelect={handleSelectedOutputToken}
              disableInput={true}
              inputTitle={' '}
              sx={{ width: '100%' }}
            />
          </Box>
          {sellRates && (
            <>
              <SwitchRates
                rates={sellRates}
                srcSymbol={selectedInputToken.symbol}
                destSymbol={selectedOutputToken.symbol}
              />
            </>
          )}
          {sellRates && user && (
            <TxModalDetails gasLimit={gasLimit} chainId={selectedChainId}>
              <Row
                caption={<Trans>{`Minimum ${selectedOutputToken.symbol} received`}</Trans>}
                captionVariant="caption"
              >
                <FormattedNumber
                  compact={false}
                  roundDown={true}
                  variant="caption"
                  value={
                    Number(normalize(sellRates.destAmount, sellRates.destDecimals)) *
                    (1 - Number(slippage))
                  }
                />
              </Row>
              <Row
                sx={{ mt: 1 }}
                caption={<Trans>Minimum USD value received</Trans>}
                captionVariant="caption"
              >
                <FormattedNumber
                  symbol="usd"
                  symbolsVariant="caption"
                  variant="caption"
                  value={Number(sellRates.destUSD) * (1 - Number(slippage))}
                />
              </Row>
            </TxModalDetails>
          )}
          {user ? (
            <>
              <SwitchErrors
                ratesError={ratesError}
                balance={selectedInputToken.balance}
                inputAmount={debounceInputAmount}
              />
              {txError && <ParaswapErrorDisplay txError={txError} />}
              <SwitchActions
                isWrongNetwork={isWrongNetwork.isWrongNetwork}
                inputAmount={debounceInputAmount}
                inputToken={selectedInputToken.address}
                outputToken={selectedOutputToken.address}
                inputName={selectedInputToken.name}
                outputName={selectedOutputToken.name}
                slippage={slippage}
                blocked={
                  !sellRates ||
                  Number(debounceInputAmount) > Number(selectedInputToken.balance) ||
                  !user
                }
                chainId={selectedChainId}
                route={sellRates}
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
