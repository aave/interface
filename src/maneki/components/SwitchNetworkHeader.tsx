import { Trans } from '@lingui/macro';
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';

const handleSwitchNetwork = async () => {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x61' || 97 }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x61' || 97,
              rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
              chainName: 'BNB Smart Chain - Testnet',
              nativeCurrency: {
                symbol: 'TBNB',
                name: 'Binance',
                decimals: 18,
              },
              blockExplorerUrls: ['https://testnet.bscscan.com'],
            },
          ],
        });
      } catch (addError) {
        // handle "add" error
        console.log('Add Error Message: ', addError.message);
      }
    } else {
      console.log('Switch Error Message: ', switchError.message);
    }
  }
};

const SwitchNetworkHeader = () => {
  const theme = useTheme();
  const downToMD = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        bgcolor: '#F26464',
        p: '12px 20px',
        display: 'flex',
        flexDirection: downToMD ? 'column' : 'row',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        gap: downToMD ? '0px' : '12px',
      }}
    >
      <Typography
        sx={{
          fontSize: '16px',
          fontWeight: '600',
          lineHeight: '21px',
          color: 'background.default',
        }}
      >
        {downToMD ? (
          <Trans>Connected to Wrong Network</Trans>
        ) : (
          <Trans>You are current connected to the wrong network</Trans>
        )}
      </Typography>
      <Button
        onClick={handleSwitchNetwork}
        sx={{
          fontSize: '16px',
          fontWeight: '900',
          lineHeight: '21px',
          color: 'background.default',
          textDecoration: 'underline',
        }}
      >
        {downToMD ? <Trans>Switch to tBNB</Trans> : <Trans>Switch to BNB Testnet</Trans>}
      </Button>
    </Box>
  );
};

const SwitchNetworkButton = () => {
  return (
    <Button onClick={handleSwitchNetwork} variant="wallet">
      <Trans>Switch to BNB Testnet</Trans>
    </Button>
  );
};

export { SwitchNetworkButton, SwitchNetworkHeader };
