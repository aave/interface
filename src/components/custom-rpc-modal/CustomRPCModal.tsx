import { ChainId } from '@aave/contract-helpers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Trans } from '@lingui/macro';
import { Button, CircularProgress, Stack, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { CustomRPCProvider, ProviderName } from 'src/components/custom-rpc-modal/CustomRPCProvider';
import { CustomRPCUrl } from 'src/components/custom-rpc-modal/CustomRPCUrl';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { networkConfigs } from 'src/ui-config/networksConfig';
import {
  CustomRPCNetwork,
  CustomRPCProvider as Provider,
  getNetworkConfig,
} from 'src/utils/marketsAndNetworksConfig';

import StyledToggleButton from '../StyledToggleButton';
import StyledToggleButtonGroup from '../StyledToggleButtonGroup';

export const CustomRPCModal = () => {
  const localStorage = global?.window?.localStorage;

  const { palette } = useTheme();
  const { type, close } = useModalContext();

  const [mode, setMode] = useState<'provider' | 'urls'>('urls');
  const [loading, setLoading] = useState<boolean>(false);
  const [networks, setNetworks] = useState<CustomRPCNetwork[]>([]);

  const [providers, setProviders] = useState<Provider[]>([
    { id: 0, name: 'alchemy', key: '' },
    { id: 1, name: 'infura', key: '' },
  ]);

  const [invalidProviders, setInvalidProviders] = useState<ProviderName[]>([]);

  useEffect(() => {
    const customRPCProviders: Provider[] = JSON.parse(
      localStorage.getItem('customRPCProviders') || '[]'
    );
    const customRPCNetwork: CustomRPCNetwork[] = JSON.parse(
      localStorage?.getItem('customRPCUrls') || '[]'
    );

    if (customRPCProviders.length) setProviders(customRPCProviders);
    if (customRPCNetwork.length) setNetworks(customRPCNetwork);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStorage]);

  const validateProviders = async () => {
    const newInvalidProviders = new Set();

    for (const provider of providers) {
      for (const network in networkConfigs) {
        const chainId = Number(network) as ChainId;
        const config = getNetworkConfig(chainId);
        const customRPCUrl = config[`${provider.name}JsonRPCUrl`];

        if (provider.key && customRPCUrl) {
          try {
            const jsonRpcProvider = new JsonRpcProvider(customRPCUrl + provider.key);

            // @ts-expect-error An argument for 'params' was not provided
            await jsonRpcProvider.send('eth_chainId');
          } catch (err) {
            newInvalidProviders.add(provider.name);
          }
        }
      }
    }

    return [...newInvalidProviders] as ProviderName[];
  };

  const saveRPCUrls = () => {
    if (networks.length) {
      localStorage.setItem('rpcSetUp', 'true');
      localStorage.setItem('usingCustomRPC', 'true');
      localStorage.setItem('customRPCUrls', JSON.stringify(networks));
    } else {
      localStorage.removeItem('customRPCUrls');
    }
  };

  const saveProviders = () => {
    if (!providers.filter((provider) => provider.key !== '').length) {
      localStorage.removeItem('customRPCProviders');
    } else {
      localStorage.setItem('rpcSetUp', 'true');
      localStorage.setItem('usingCustomRPC', 'true');
      localStorage.setItem('customRPCProviders', JSON.stringify(providers));
    }
  };

  const handleSave = async () => {
    setLoading(true);

    const newInvalidProviders = await validateProviders();

    if (newInvalidProviders.length) {
      setInvalidProviders(newInvalidProviders);
      setLoading(false);

      return;
    }

    saveRPCUrls();
    saveProviders();

    const customRPCUrls: CustomRPCNetwork[] = JSON.parse(
      global?.window?.localStorage.getItem('customRPCUrls') || 'null'
    );

    if (!providers && !customRPCUrls) {
      localStorage.removeItem('rpcSetUp');
      localStorage.removeItem('usingCustomRPC');
    }

    close();

    // Set window.location to trigger a page reload when navigating to the the dashboard
    window.location.href = '/';
  };

  return (
    <BasicModal open={type === ModalType.CustomRPC} setOpen={close}>
      <Typography variant="h2" sx={{ mb: 6 }}>
        <Trans>Add Custom RPC URLs</Trans>
      </Typography>
      <Stack gap={4}>
        <StyledToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, value) => setMode(value)}
          sx={{ width: '100%', height: '44px' }}
        >
          <StyledToggleButton value="urls" disabled={mode === 'urls'}>
            <Typography
              variant="main16"
              sx={
                mode === 'urls' && palette.mode === 'dark'
                  ? { color: palette.background.default }
                  : null
              }
            >
              <Trans>Custom Urls</Trans>
            </Typography>
          </StyledToggleButton>
          <StyledToggleButton value="provider" disabled={mode === 'provider'}>
            <Typography
              variant="main16"
              sx={
                mode === 'provider' && palette.mode === 'dark'
                  ? { color: palette.background.default }
                  : null
              }
            >
              <Trans>Api Key</Trans>
            </Typography>
          </StyledToggleButton>
        </StyledToggleButtonGroup>

        {mode === 'provider' ? (
          <CustomRPCProvider
            providers={providers}
            setProviders={setProviders}
            invalidProviders={invalidProviders}
          />
        ) : (
          <CustomRPCUrl networks={networks} setNetworks={setNetworks} />
        )}
        <Button variant="contained" disabled={loading} sx={{ mt: 4 }} onClick={handleSave}>
          {loading ? <CircularProgress size={16} thickness={2} value={100} /> : 'Save'}
        </Button>
      </Stack>
    </BasicModal>
  );
};
