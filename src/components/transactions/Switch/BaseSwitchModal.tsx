import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { supportedNetworksWithEnabledMarket } from 'src/components/transactions/Switch/common';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { useTokensBalance } from 'src/hooks/generic/useTokensBalance';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { CustomMarket, marketsData } from 'src/utils/marketsAndNetworksConfig';

import {
  BaseSwitchModalContent,
  getFilteredTokensForSwitch,
  SwitchModalCustomizableProps,
} from './BaseSwitchModalContent';

const defaultNetwork = marketsData[CustomMarket.proto_mainnet_v3];

export const BaseSwitchModal = ({
  modalType,
  inputBalanceTitle: balanceTitle,
  forcedDefaultInputToken,
  forcedDefaultOutputToken,
  tokensFrom: forcedTokensFrom,
  tokensTo: forcedTokensTo,
  showSwitchInputAndOutputAssetsButton = true,
  forcedChainId,
}: SwitchModalCustomizableProps) => {
  const {
    type,
    close,
    args: { chainId },
  } = useModalContext();

  const overallAppChainId = useRootStore((store) => store.currentChainId);
  const { chainId: connectedChainId } = useWeb3Context();
  const user = useRootStore((store) => store.account);

  const [selectedChainId, setSelectedChainId] = useState(() => {
    if (forcedChainId) {
      return forcedChainId;
    }
    if (supportedNetworksWithEnabledMarket.find((elem) => elem.chainId === overallAppChainId))
      return overallAppChainId;
    return defaultNetwork.chainId;
  });

  useEffect(() => {
    if (forcedChainId) {
      setSelectedChainId(forcedChainId);
      return;
    }

    // Passing chainId as prop will set default network for switch modal
    if (chainId && supportedNetworksWithEnabledMarket.find((elem) => elem.chainId === chainId)) {
      setSelectedChainId(chainId);
    } else if (
      connectedChainId &&
      supportedNetworksWithEnabledMarket.find((elem) => elem.chainId === connectedChainId)
    ) {
      const supportedFork = supportedNetworksWithEnabledMarket.find(
        (elem) => elem.underlyingChainId === connectedChainId
      );
      setSelectedChainId(supportedFork ? supportedFork.chainId : connectedChainId);
    } else if (
      supportedNetworksWithEnabledMarket.find((elem) => elem.chainId === overallAppChainId)
    ) {
      setSelectedChainId(overallAppChainId);
    } else {
      setSelectedChainId(defaultNetwork.chainId);
    }
  }, [overallAppChainId, chainId, connectedChainId]);

  const initialDefaultFromTokens = useMemo(
    () => getFilteredTokensForSwitch(selectedChainId),
    [selectedChainId]
  );
  const initialDefaultToTokens = useMemo(
    () => getFilteredTokensForSwitch(selectedChainId),
    [selectedChainId]
  );

  const {
    data: initialFromTokens,
    refetch: refetchInitialFromTokens,
    isFetching: fromTokensLoading,
  } = useTokensBalance(initialDefaultFromTokens, selectedChainId, user);

  const {
    data: initialToTokens,
    refetch: refetchInitialToTokens,
    isFetching: toTokensLoading,
  } = useTokensBalance(initialDefaultToTokens, selectedChainId, user);

  return (
    <BasicModal open={type === modalType} setOpen={close}>
      {!user ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4, alignItems: 'center' }}>
          <Typography sx={{ mb: 6, textAlign: 'center' }} color="text.secondary">
            <Trans>Please connect your wallet to swap tokens.</Trans>
          </Typography>
          <ConnectWalletButton onClick={() => close()} />
        </Box>
      ) : (
        <BaseSwitchModalContent
          forcedChainId={selectedChainId}
          supportedNetworks={supportedNetworksWithEnabledMarket}
          initialFromTokens={forcedTokensFrom ?? initialFromTokens ?? []}
          initialToTokens={forcedTokensTo ?? initialToTokens ?? []}
          tokensLoading={fromTokensLoading || toTokensLoading}
          modalType={modalType}
          inputBalanceTitle={balanceTitle}
          forcedDefaultInputToken={forcedDefaultInputToken}
          forcedDefaultOutputToken={forcedDefaultOutputToken}
          showSwitchInputAndOutputAssetsButton={showSwitchInputAndOutputAssetsButton}
          selectedChainId={selectedChainId}
          setSelectedChainId={setSelectedChainId}
          refetchInitialTokens={() => {
            refetchInitialFromTokens();
            refetchInitialToTokens();
          }}
        />
      )}
    </BasicModal>
  );
};
