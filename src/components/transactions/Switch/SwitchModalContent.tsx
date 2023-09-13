import { normalize, normalizeBN } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, CircularProgress } from '@mui/material';
import React, { useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { useParaswapSellRates } from 'src/hooks/paraswap/useParaswapRates';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { AssetInput } from '../AssetInput';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
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
}

export const SwitchModalContent = ({
  supportedNetworks,
  selectedChainId,
  setSelectedChainId,
  reserves,
}: SwitchModalContentProps) => {
  const [slippage, setSlippage] = useState('0.001');
  const [inputAmount, setInputAmount] = useState('0');
  const { mainTxState: switchTxState, gasLimit } = useModalContext();
  const user = useRootStore((store) => store.account);
  const [selectedInputReserve, setSelectedInputReserve] = useState(reserves[0]);
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
    chainId: selectedChainId,
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
          <AssetInput
            assets={reserves}
            value={inputAmount}
            onChange={handleInputChange}
            usdValue={sellRates?.srcUSD || '0'}
            symbol={selectedInputReserve?.symbol}
            onSelect={setSelectedInputReserve}
            inputTitle={' '}
          />
          <AssetInput
            assets={reserves}
            value={
              sellRates ? normalizeBN(sellRates.destAmount, sellRates.destDecimals).toString() : '0'
            }
            usdValue={sellRates?.destUSD || '0'}
            symbol={selectedOutputReserve?.symbol}
            loading={inputAmount !== '0' && ratesLoading && !ratesError}
            onSelect={setSelectedOutputReserve}
            disableInput={true}
            inputTitle={' '}
          />
          {sellRates && (
            <>
              <SwitchRates
                rates={sellRates}
                srcSymbol={selectedInputReserve.symbol}
                destSymbol={selectedOutputReserve.symbol}
              />
            </>
          )}
          {sellRates && (
            <TxModalDetails gasLimit={gasLimit}>
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

          <SwitchErrors
            ratesError={ratesError}
            balance={selectedInputReserve.balance}
            inputAmount={inputAmount}
          />

          <SwitchActions
            isWrongNetwork={isWrongNetwork.isWrongNetwork}
            inputAmount={inputAmount}
            inputToken={selectedInputReserve.underlyingAsset}
            outputToken={selectedOutputReserve.underlyingAsset}
            slippage={slippage}
            blocked={!sellRates || Number(inputAmount) > Number(selectedInputReserve.balance)}
            chainId={selectedChainId}
            route={sellRates}
          />
        </>
      )}
    </>
  );
};
