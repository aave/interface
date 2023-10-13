import { normalize, normalizeBN } from '@aave/math-utils';
import { ArrowDownIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, CircularProgress, IconButton, SvgIcon, Typography } from '@mui/material';
import React, { useState } from 'react';
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

import { AssetInput } from '../AssetInput';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { ParaswapErrorDisplay } from '../Warnings/ParaswapErrorDisplay';
import { SupportedNetworkWithChainId } from './common';
import { NetworkSelector } from './NetworkSelector';
import { SwitchActions } from './SwitchActions';
import { SwitchErrors } from './SwitchErrors';
import { ReserveWithBalance } from './SwitchModal';
import { SwitchRates } from './SwitchRates';
import { SwitchSlippageSelector } from './SwitchSlippageSelector';
import { SwitchTxSuccessView } from './SwitchTxSuccessView';

interface SwitchModalContentProps {
  selectedChainId: number;
  setSelectedChainId: (value: number) => void;
  supportedNetworks: SupportedNetworkWithChainId[];
  reserves: ReserveWithBalance[];
  selectedNetworkConfig: NetworkConfig;
}

export const SwitchModalContent = ({
  supportedNetworks,
  selectedChainId,
  setSelectedChainId,
  reserves,
  selectedNetworkConfig,
}: SwitchModalContentProps) => {
  const [slippage, setSlippage] = useState('0.001');
  const [inputAmount, setInputAmount] = useState('0');
  const { mainTxState: switchTxState, gasLimit, txError } = useModalContext();
  const user = useRootStore((store) => store.account);
  const [selectedInputReserve, setSelectedInputReserve] = useState(() => {
    if (reserves[0].symbol === 'GHO') {
      return reserves[1];
    }
    return reserves[0];
  });
  const { readOnlyModeAddress } = useWeb3Context();
  const [selectedOutputReserve, setSelectedOutputReserve] = useState(() => {
    const gho = reserves.find((reserve) => reserve.symbol === 'GHO');
    if (gho) return gho;
    return reserves[1];
  });
  const isWrongNetwork = useIsWrongNetwork(selectedChainId);

  const handleInputChange = (value: string) => {
    if (value === '') {
      setInputAmount('0');
    } else if (value === '-1' && selectedInputReserve) {
      setInputAmount(selectedInputReserve.balance);
    } else {
      setInputAmount(value);
    }
  };

  const {
    data: sellRates,
    isLoading: ratesLoading,
    error: ratesError,
  } = useParaswapSellRates({
    chainId: selectedNetworkConfig.underlyingChainId ?? selectedChainId,
    amount: normalizeBN(inputAmount, -1 * selectedInputReserve.decimals).toFixed(0),
    srcToken: selectedInputReserve.underlyingAsset,
    srcDecimals: selectedInputReserve.decimals,
    destToken: selectedOutputReserve.underlyingAsset,
    destDecimals: selectedOutputReserve.decimals,
    user,
  });

  if (sellRates && switchTxState.success) {
    return (
      <SwitchTxSuccessView
        txHash={switchTxState.txHash}
        amount={inputAmount}
        symbol={selectedInputReserve.symbol}
        outSymbol={selectedOutputReserve.symbol}
        outAmount={normalize(sellRates.destAmount, sellRates.destDecimals)}
      />
    );
  }

  const onSwitchReserves = () => {
    const fromReserve = selectedInputReserve;
    const toReserve = selectedOutputReserve;
    const toInput = sellRates
      ? normalizeBN(sellRates.destAmount, sellRates.destDecimals).toString()
      : '0';
    setSelectedInputReserve(toReserve);
    setSelectedOutputReserve(fromReserve);
    setInputAmount(toInput);
  };

  return (
    <>
      <TxModalTitle title="Switch tokens" />
      {isWrongNetwork.isWrongNetwork && !readOnlyModeAddress && (
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
          setSelectedNetwork={setSelectedChainId}
        />
        <SwitchSlippageSelector slippage={slippage} setSlippage={setSlippage} />
      </Box>
      {!selectedInputReserve || !selectedOutputReserve ? (
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
            <AssetInput
              assets={reserves.filter(
                (elem) => elem.underlyingAsset !== selectedOutputReserve.underlyingAsset
              )}
              value={inputAmount}
              onChange={handleInputChange}
              usdValue={sellRates?.srcUSD || '0'}
              symbol={selectedInputReserve?.symbol}
              onSelect={setSelectedInputReserve}
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
                <ArrowDownIcon />
              </SvgIcon>
            </IconButton>
            <AssetInput
              assets={reserves.filter(
                (elem) => elem.underlyingAsset !== selectedInputReserve.underlyingAsset
              )}
              value={
                sellRates
                  ? normalizeBN(sellRates.destAmount, sellRates.destDecimals).toString()
                  : '0'
              }
              usdValue={sellRates?.destUSD || '0'}
              symbol={selectedOutputReserve?.symbol}
              loading={inputAmount !== '0' && ratesLoading && !ratesError}
              onSelect={setSelectedOutputReserve}
              disableInput={true}
              inputTitle={' '}
              sx={{ width: '100%' }}
            />
          </Box>
          {sellRates && (
            <>
              <SwitchRates
                rates={sellRates}
                srcSymbol={selectedInputReserve.symbol}
                destSymbol={selectedOutputReserve.symbol}
              />
            </>
          )}
          {sellRates && user && (
            <TxModalDetails gasLimit={gasLimit} chainId={selectedChainId}>
              <Row
                caption={<Trans>{`Minimum ${selectedOutputReserve.symbol} received`}</Trans>}
                captionVariant="caption"
              >
                <FormattedNumber
                  compact={false}
                  roundDown={true}
                  variant="caption"
                  value={
                    Number(normalize(sellRates.destAmount, sellRates.destDecimals)) *
                    (1 - Number(slippage) / 100)
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
                  value={Number(sellRates.destUSD) * (1 - Number(slippage) / 100)}
                />
              </Row>
            </TxModalDetails>
          )}
          {user ? (
            <>
              <SwitchErrors
                ratesError={ratesError}
                balance={selectedInputReserve.balance}
                inputAmount={inputAmount}
              />
              {txError && <ParaswapErrorDisplay txError={txError} />}
              <SwitchActions
                isWrongNetwork={isWrongNetwork.isWrongNetwork}
                inputAmount={inputAmount}
                inputToken={selectedInputReserve.underlyingAsset}
                outputToken={selectedOutputReserve.underlyingAsset}
                slippage={slippage}
                blocked={
                  !sellRates || Number(inputAmount) > Number(selectedInputReserve.balance) || !user
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
