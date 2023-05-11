import { ChainId } from '@aave/contract-helpers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Trans } from '@lingui/macro';
import {
  Button,
  CircularProgress,
  InputBase,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { networkConfigs } from 'src/ui-config/networksConfig';
import {
  CustomRPCProvider as Provider,
  getNetworkConfig,
} from 'src/utils/marketsAndNetworksConfig';

type InvalidProviders = 'alchemy' | 'infura';

type Props = {
  handleClose: () => void;
};

export const CustomRPCProvider: React.FC<Props> = ({ handleClose }) => {
  const { breakpoints } = useTheme();
  const sm = useMediaQuery(breakpoints.down('sm'));
  const [providers, setProviders] = useState<Provider[]>([
    { id: 0, name: 'alchemy', key: '' },
    { id: 1, name: 'infura', key: '' },
  ]);
  const [invalidProviders, setInvalidProviders] = useState<InvalidProviders[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const localStorage = global?.window?.localStorage;

  useEffect(() => {
    const customRPCProviders: Provider[] = JSON.parse(
      localStorage.getItem('customRPCProviders') || '[]'
    );

    if (customRPCProviders.length) {
      setProviders(customRPCProviders);
    }
  }, [localStorage]);

  const handleInput = (id: number, newKey: string) => {
    const newProviders = providers.map((provider) =>
      provider.id === id ? { ...provider, key: newKey } : provider
    );
    setProviders(newProviders);
  };

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

    setInvalidProviders([...newInvalidProviders] as InvalidProviders[]);
    return newInvalidProviders.size;
  };

  const handleSave = async () => {
    setLoading(true);
    if (await validateProviders()) {
      setLoading(false);
      return;
    }

    if (!providers.filter((provider) => provider.key !== '').length) {
      localStorage.removeItem('customRPCProviders');
    } else {
      localStorage.setItem('rpcSetUp', 'true');
      localStorage.setItem('usingCustomRPC', 'true');
      localStorage.setItem('customRPCProviders', JSON.stringify(providers));
    }

    handleClose();
  };

  return (
    <Stack gap={4}>
      {providers.map((provider: Provider) => (
        <Stack gap={1} key={provider.id}>
          <Typography
            variant="main16"
            sx={{ display: 'flex', alignItems: 'center', gap: 1, textTransform: 'capitalize' }}
          >
            <img
              src={`/icons/rpc-providers/${provider.name}.png`}
              alt={`${provider.name} icon`}
              style={{ width: '30px', borderRadius: '50%' }}
            />
            <Trans>{provider.name}</Trans>
          </Typography>
          <InputBase
            sx={(theme) => ({
              py: 1,
              px: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '6px',
              mb: 1,
              overflow: 'show',
              fontSize: sm ? '16px' : '14px',
            })}
            placeholder="Enter the Api key"
            value={provider.key}
            fullWidth
            onChange={(e) => {
              handleInput(provider.id, e.target.value || '');
            }}
          />
          {invalidProviders.includes(provider.name) && (
            <Typography variant="caption" color="error" ml={2}>
              <text style={{ textTransform: 'capitalize' }}>
                <Trans>{provider.name}</Trans>{' '}
              </text>
              <Trans>Api key is not valid. Please try again with a different Api Key</Trans>
            </Typography>
          )}
        </Stack>
      ))}

      <Button variant="contained" disabled={loading} sx={{ mt: 4 }} onClick={handleSave}>
        {loading ? <CircularProgress size={16} thickness={2} value={100} /> : 'Save'}
      </Button>
    </Stack>
  );
};
