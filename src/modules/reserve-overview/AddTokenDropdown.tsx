import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { Trans } from '@lingui/macro';
import { Box, Menu, MenuItem, SvgIcon, Typography } from '@mui/material';
import * as React from 'react';
import { useState } from 'react';
import { CircleIcon } from 'src/components/CircleIcon';
import { Base64Token, TokenIcon } from 'src/components/primitives/TokenIcon';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ERC20TokenType } from 'src/libs/web3-data-provider/Web3Provider';

interface AddTokenDropdownProps {
  poolReserve: ComputedReserveData;
  downToSM: boolean;
  switchNetwork: (chainId: number) => Promise<void>;
  addERC20Token: (args: ERC20TokenType) => Promise<boolean>;
  currentChainId: number;
  connectedChainId: number;
}

export const AddTokenDropdown = ({
  poolReserve,
  downToSM,
  switchNetwork,
  addERC20Token,
  currentChainId,
  connectedChainId,
}: AddTokenDropdownProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [underlyingBase64, setUnderlyingBase64] = useState('');
  const [aTokenBase64, setATokenBase64] = useState('');
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {/* Load base64 token symbol for adding token to wallet */}
      {poolReserve?.symbol && !/_/.test(poolReserve.symbol) && (
        <Base64Token
          symbol={poolReserve.iconSymbol}
          onImageGenerated={setUnderlyingBase64}
          aToken={false}
        />
      )}
      {/* Load base64 token symbol for adding token to wallet */}
      {poolReserve?.symbol && !/_/.test(poolReserve.symbol) && (
        <Base64Token
          symbol={poolReserve.iconSymbol}
          onImageGenerated={setATokenBase64}
          aToken={true}
        />
      )}
      <Box onClick={handleClick}>
        <CircleIcon tooltipText="Add token to wallet" downToSM={downToSM}>
          <Box
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
        </CircleIcon>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        keepMounted={true}
        data-cy="addToWaletSelector"
        sx={{ mt: '10px' }}
      >
        <Box sx={{ px: '16px', py: '12px' }}>
          <Typography variant="secondary12" color="text.secondary">
            <Trans>Select token to add</Trans>
          </Typography>
        </Box>

        <MenuItem
          key="underlying"
          value="underlying"
          onClick={() => {
            if (currentChainId !== connectedChainId) {
              switchNetwork(currentChainId).then(() => {
                addERC20Token({
                  address: poolReserve.underlyingAsset,
                  decimals: poolReserve.decimals,
                  symbol: poolReserve.symbol,
                  image: !/_/.test(poolReserve.iconSymbol) ? underlyingBase64 : undefined,
                });
              });
            } else {
              addERC20Token({
                address: poolReserve.underlyingAsset,
                decimals: poolReserve.decimals,
                symbol: poolReserve.symbol,
                image: !/_/.test(poolReserve.symbol) ? underlyingBase64 : undefined,
              });
            }
          }}
        >
          <TokenIcon symbol={poolReserve.iconSymbol} fontSize="large" />
          <Typography variant="subheader1" sx={{ ml: 3 }} noWrap data-cy={`assetName`}>
            {poolReserve.symbol}
          </Typography>
        </MenuItem>

        <MenuItem
          key="atoken"
          value="atoken"
          onClick={() => {
            if (currentChainId !== connectedChainId) {
              switchNetwork(currentChainId).then(() => {
                addERC20Token({
                  address: poolReserve.aTokenAddress,
                  decimals: poolReserve.decimals,
                  symbol: `a${poolReserve.symbol}`,
                  image: !/_/.test(poolReserve.symbol) ? aTokenBase64 : undefined,
                });
              });
            } else {
              addERC20Token({
                address: poolReserve.aTokenAddress,
                decimals: poolReserve.decimals,
                symbol: `a${poolReserve.symbol}`,
                image: !/_/.test(poolReserve.symbol) ? aTokenBase64 : undefined,
              });
            }
          }}
        >
          <TokenIcon symbol={poolReserve.iconSymbol} fontSize="large" aToken={true} />
          <Typography variant="subheader1" sx={{ ml: 3 }} noWrap data-cy={`assetName`}>
            {`a${poolReserve.symbol}`}
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};
