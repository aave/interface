import { Box, SvgIcon } from '@mui/material';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ERC20TokenType } from 'src/libs/web3-data-provider/Web3Provider';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export interface AddToWalletProps {
  poolReserve: ComputedReserveData;
  currentChainId: number;
  connectedChainId: number;
  switchNetwork: (chainId: number) => Promise<void>;
  addERC20Token: (args: ERC20TokenType) => Promise<boolean>;
  iconBase64: string;
}

export const AddToWallet = ({
  poolReserve,
  currentChainId,
  connectedChainId,
  switchNetwork,
  addERC20Token,
  iconBase64,
}: AddToWalletProps) => {
  return (
    <Box
      onClick={() => {
        if (currentChainId !== connectedChainId) {
          switchNetwork(currentChainId).then(() => {
            addERC20Token({
              address: poolReserve.underlyingAsset,
              decimals: poolReserve.decimals,
              symbol: poolReserve.symbol,
              image: !/_/.test(poolReserve.symbol) ? iconBase64 : undefined,
            });
          });
        } else {
          addERC20Token({
            address: poolReserve.underlyingAsset,
            decimals: poolReserve.decimals,
            symbol: poolReserve.symbol,
            image: !/_/.test(poolReserve.symbol) ? iconBase64 : undefined,
          });
        }
      }}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        color: '#A5A8B6',
        '&:hover': { color: '#F1F1F3' },
        cursor: 'pointer',
      }}
    >
      <SvgIcon sx={{ fontSize: '14px' }}>
        <AccountBalanceWalletIcon />
      </SvgIcon>
    </Box>
  );
};
