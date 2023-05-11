import { Trans } from '@lingui/macro';
import { Button, InputBase, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { CustomRPCProvider as Provider } from 'src/utils/marketsAndNetworksConfig';

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

  const handleSave = () => {
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
        </Stack>
      ))}
      <Button variant="contained" sx={{ mt: 4 }} onClick={handleSave}>
        Save
      </Button>
    </Stack>
  );
};
