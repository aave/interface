import { Trans } from '@lingui/macro';
import { InputBase, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { CustomRPCProvider as Provider } from 'src/utils/marketsAndNetworksConfig';

export type ProviderName = 'alchemy' | 'infura';

type Props = {
  providers: Provider[];
  setProviders: (providers: Provider[]) => void;
  invalidProviders: ProviderName[];
};

export const CustomRPCProvider: React.FC<Props> = ({
  providers,
  setProviders,
  invalidProviders,
}) => {
  const { breakpoints } = useTheme();
  const sm = useMediaQuery(breakpoints.down('sm'));

  const handleInput = (id: number, newKey: string) => {
    const newProviders = providers.map((provider) =>
      provider.id === id ? { ...provider, key: newKey } : provider
    );
    setProviders(newProviders);
  };

  return (
    <>
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
    </>
  );
};
