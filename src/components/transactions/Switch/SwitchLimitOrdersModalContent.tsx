import { CustomMarket, marketsData } from "src/ui-config/marketsConfig";
import { ChangeNetworkWarning } from "../Warnings/ChangeNetworkWarning";
import { useMemo, useState } from "react";
import { useIsWrongNetwork } from "src/hooks/useIsWrongNetwork";
import { useRootStore } from "src/store/root";
import { useWeb3Context } from "src/libs/hooks/useWeb3Context";
import { NetworkSelector } from "./NetworkSelector";
import { GENERAL } from "src/utils/events";
import { useGetConnectedWalletType } from "src/hooks/useGetConnectedWalletType";
import { getNetworkConfig } from "src/utils/marketsAndNetworksConfig";
import { supportedNetworksWithEnabledMarketLimit } from "./common";
import { Box, IconButton, SvgIcon } from "@mui/material";
import { SwitchAssetInput } from "./SwitchAssetInput";
import { SwitchVerticalIcon } from "@heroicons/react/solid";
import { getFilteredTokensForSwitch } from "./BaseSwitchModal";
import { useTokensBalance } from "src/hooks/generic/useTokensBalance";
import { isNativeToken } from "./cowprotocol/cowprotocol.helpers";
import { SupportedChainId, WRAPPED_NATIVE_CURRENCIES } from "@cowprotocol/cow-sdk";

const defaultNetwork = marketsData[CustomMarket.proto_mainnet_v3];

export const SwitchLimitOrdersInputs = () => {

}

export const SwitchLimitOrdersModalContent = () => {
  const { readOnlyModeAddress } = useWeb3Context();

  const dashboardChainId = useRootStore((store) => store.currentChainId);
  const user = useRootStore((store) => store.account);


  const [selectedChainId, setSelectedChainId] = useState(() => {
    if (supportedNetworksWithEnabledMarketLimit.find((elem) => elem.chainId === dashboardChainId))
      return dashboardChainId;
    return defaultNetwork.chainId;
  });

  const tokens = useMemo(
    () => getFilteredTokensForSwitch(selectedChainId),
    [selectedChainId]
  );
  const [selectedInputToken, setSelectedInputToken] = useState(
    tokens.find((token) => (token.balance !== '0' || token.extensions?.isNative) && token.symbol !== 'GHO')
  );
  const [selectedOutputToken, setSelectedOutputToken] = useState(
    tokens.find((token) => token.symbol == 'GHO')
  );

  const { data: tokensWithBalance } = useTokensBalance(tokens, selectedChainId, user);

  const isWrongNetwork = useIsWrongNetwork(selectedChainId);
  const { isSmartContractWallet, isSafeWallet } = useGetConnectedWalletType();

  const showChangeNetworkWarning = isWrongNetwork.isWrongNetwork && !readOnlyModeAddress;
  const selectedNetworkConfig = getNetworkConfig(selectedChainId);

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
              balanceTitle={'Sell exactly'}
              assets={tokensWithBalance ? tokensWithBalance.filter(
                (token) =>
                  token.address !== selectedOutputToken?.address &&
                  Number(token.balance) !== 0 &&
                  // Remove native tokens for non-Safe smart contract wallets
                  !(isSmartContractWallet && !isSafeWallet && token.extensions?.isNative) &&
                  // Avoid wrapping
                  !(
                    isNativeToken(selectedOutputToken?.address) &&
                    token.address.toLowerCase() ===
                      WRAPPED_NATIVE_CURRENCIES[
                        selectedChainId as SupportedChainId
                      ]?.address.toLowerCase()
                  ) &&
                  !(
                    selectedOutputToken?.address.toLowerCase() ===
                      WRAPPED_NATIVE_CURRENCIES[
                        selectedChainId as SupportedChainId
                      ]?.address.toLowerCase() && isNativeToken(token.address)
                  )
                ): []}
              onChange={handleInputChange}
              usdValue={switchRates?.srcUSD || '0'}
              onSelect={handleSelectedInputToken}
              selectedAsset={selectedInputToken}
              forcedMaxValue={maxAmountFormatted}
              allowCustomTokens={true}
            />
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
            <SwitchAssetInput
              chainId={selectedChainId}
              balanceTitle={'Receive at least'}
              assets={tokensWithBalance ? tokensWithBalance.filter(
                (token) =>
                  token.address !== selectedInputToken?.address &&
                  // Avoid wrapping
                  !(
                    isNativeToken(selectedInputToken?.address) &&
                    token.address.toLowerCase() ===
                      WRAPPED_NATIVE_CURRENCIES[
                        selectedChainId as SupportedChainId
                      ]?.address.toLowerCase()
                  ) &&
                  !(
                    selectedInputToken?.address.toLowerCase() ===
                      WRAPPED_NATIVE_CURRENCIES[
                        selectedChainId as SupportedChainId
                      ]?.address.toLowerCase() && isNativeToken(token.address)
                  )
              ): []}
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
              allowCustomTokens={true}
            />
          </Box>
    </>
  );
};
