import { Trans } from '@lingui/macro';
import { Box, InputBase, ListItem, Stack, Typography } from '@mui/material';
import { FormattedNetwork } from 'src/components/custom-rpc-modal/CustomRPCUrl';
import { getMarketHelpData } from 'src/helpers/get-market-help-data';

type Props = {
  network: FormattedNetwork;
  invalid: boolean;
  handleInput: (chainId: number, newUrl: string) => void;
};

export const NetworkInput: React.FC<Props> = ({ network, invalid, handleInput }) => {
  const testNetName = getMarketHelpData(network.name).testChainName;
  return (
    <ListItem key={network.chainId}>
      <Stack gap={1} width="100%">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <img
              src={network.icon}
              alt={`${network.name} icon`}
              style={{ width: '30px', borderRadius: '50%' }}
            />
            {testNetName && (
              <Box
                sx={{
                  bgcolor: '#29B6F6',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  color: 'common.white',
                  fontSize: '12px',
                  lineHeight: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute',
                  right: '-2px',
                  bottom: '-2px',
                }}
              >
                {testNetName.split('')[0]}
              </Box>
            )}
          </Box>
          <Typography variant="main16">
            {network.name.split(' ')[0]} {testNetName || ''}
          </Typography>
        </Box>
        <InputBase
          sx={(theme) => ({
            py: 1,
            px: 3,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '6px',
            mb: 1,
            overflow: 'show',
            fontSize: '14px',
          })}
          placeholder="Enter RPC Url"
          value={network.url}
          fullWidth
          onChange={(e) => {
            handleInput(network.chainId, e.target.value || '');
          }}
        />
        {invalid && (
          <Typography variant="caption" color="error" ml={2}>
            <Trans>RPC Url is not valid. Please try again with a different RPC Url</Trans>
          </Typography>
        )}
      </Stack>
    </ListItem>
  );
};
