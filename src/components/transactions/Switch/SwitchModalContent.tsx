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
import { TokenInterface } from './SwitchModal';
import { SwitchRates } from './SwitchRates';
import { SwitchSlippageSelector } from './SwitchSlippageSelector';
import { SwitchTxSuccessView } from './SwitchTxSuccessView';

interface SwitchModalContentProps {
  selectedChainId: number;
  setSelectedChainId: (value: number) => void;
  supportedNetworks: SupportedNetworkWithChainId[];
  reserves: TokenInterface[];
  selectedNetworkConfig: NetworkConfig;
  defaultAsset?: string;
}

const GHO_TOKEN_ADDRESS = AaveV3Ethereum.ASSETS.GHO.UNDERLYING;

export const SwitchModalContent = ({
  supportedNetworks,
  selectedChainId,
  setSelectedChainId,
  reserves,
  selectedNetworkConfig,
}: // defaultAsset,
SwitchModalContentProps) => {
  const [slippage, setSlippage] = useState('0.001');
  const [inputAmount, setInputAmount] = useState('');
  const [debounceInputAmount, setDebounceInputAmount] = useState('');
  const { mainTxState: switchTxState, gasLimit, txError, setTxError } = useModalContext();
  const user = useRootStore((store) => store.account);

  const getDefaultInputReserve = () => {
    if (reserves[0].address === GHO_TOKEN_ADDRESS) {
      return reserves[1];
    }
    return reserves[0];
  };

  const getDefaultOutputReserve = () => {
    const gho = reserves.find((reserve) => reserve.address === GHO_TOKEN_ADDRESS);
    const aave = reserves.find((elem) => elem.symbol == 'AAVE');
    if (gho) return gho;
    if (aave) return aave;
    return reserves[1];
  };

  useEffect(() => {
    setSelectedInputReserve(getDefaultInputReserve());
    setSelectedOutputReserve(getDefaultOutputReserve());
  }, [reserves]);

  const [selectedInputReserve, setSelectedInputReserve] = useState(() => getDefaultInputReserve());
  const [selectedOutputReserve, setSelectedOutputReserve] = useState(() =>
    getDefaultOutputReserve()
  );

  const { readOnlyModeAddress } = useWeb3Context();

  const isWrongNetwork = useIsWrongNetwork(selectedChainId);

  const handleInputChange = (value: string) => {
    setTxError(undefined);
    if (value === '-1') {
      setInputAmount(selectedInputReserve.balance);
      debouncedInputChange(selectedInputReserve.balance);
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
        : normalizeBN(debounceInputAmount, -1 * selectedInputReserve.decimals).toFixed(0),
    srcToken: selectedInputReserve.address,
    srcDecimals: selectedInputReserve.decimals,
    destToken: selectedOutputReserve.address,
    destDecimals: selectedOutputReserve.decimals,
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
        symbol={selectedInputReserve.symbol}
        iconSymbol={selectedInputReserve.symbol}
        iconUri={selectedInputReserve.logoURI}
        outSymbol={selectedOutputReserve.symbol}
        outIconSymbol={selectedOutputReserve.symbol}
        outIconUri={selectedOutputReserve.logoURI}
        outAmount={(
          Number(normalize(sellRates.destAmount, sellRates.destDecimals)) *
          (1 - Number(slippage))
        ).toString()}
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
    setDebounceInputAmount(toInput);
    setTxError(undefined);
  };

  const handleSelectedInputReserve = (reserve: TokenInterface) => {
    setTxError(undefined);
    setSelectedInputReserve(reserve);
  };

  const handleSelectedOutputReserve = (reserve: TokenInterface) => {
    setTxError(undefined);
    setSelectedOutputReserve(reserve);
  };

  const handleSelectedNetworkChange = (value: number) => {
    setTxError(undefined);
    setSelectedChainId(value);
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
          setSelectedNetwork={handleSelectedNetworkChange}
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
            <SwitchAssetInput
              assets={reserves.filter((elem) => elem.address !== selectedOutputReserve.address)}
              value={inputAmount}
              onChange={handleInputChange}
              usdValue={sellRates?.srcUSD || '0'}
              symbol={selectedInputReserve?.symbol}
              onSelect={handleSelectedInputReserve}
              inputTitle={' '}
              sx={{ width: '100%' }}
              swapAssets={true}
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
              assets={reserves.filter((elem) => elem.address !== selectedInputReserve.address)}
              value={
                sellRates
                  ? normalizeBN(sellRates.destAmount, sellRates.destDecimals).toString()
                  : '0'
              }
              usdValue={sellRates?.destUSD || '0'}
              symbol={selectedOutputReserve?.symbol}
              loading={
                debounceInputAmount !== '0' &&
                debounceInputAmount !== '' &&
                ratesLoading &&
                !ratesError
              }
              onSelect={handleSelectedOutputReserve}
              disableInput={true}
              inputTitle={' '}
              sx={{ width: '100%' }}
              swapAssets={true}
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
                balance={selectedInputReserve.balance}
                inputAmount={debounceInputAmount}
              />
              {txError && <ParaswapErrorDisplay txError={txError} />}
              <SwitchActions
                isWrongNetwork={isWrongNetwork.isWrongNetwork}
                inputAmount={debounceInputAmount}
                inputToken={selectedInputReserve.address}
                outputToken={selectedOutputReserve.address}
                inputName={selectedInputReserve.name}
                outputName={selectedOutputReserve.name}
                slippage={slippage}
                blocked={
                  !sellRates ||
                  Number(debounceInputAmount) > Number(selectedInputReserve.balance) ||
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
