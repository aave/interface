import { Trans } from '@lingui/macro';
import { Box, Menu, MenuItem, Typography } from '@mui/material';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { CircleIcon } from 'src/components/CircleIcon';
import { WalletIcon } from 'src/components/icons/WalletIcon';
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
  hideAToken?: boolean;
}

export const AddTokenDropdown = ({
  poolReserve,
  downToSM,
  switchNetwork,
  addERC20Token,
  currentChainId,
  connectedChainId,
  hideAToken,
}: AddTokenDropdownProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [changingNetwork, setChangingNetwork] = useState(false);
  const [underlyingBase64, setUnderlyingBase64] = useState('');
  const [aTokenBase64, setATokenBase64] = useState('');
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // The switchNetwork function has no return type, so to detect if a user successfully switched networks before adding token to wallet, check the selected vs connected chain id
  useEffect(() => {
    if (changingNetwork && currentChainId === connectedChainId) {
      addERC20Token({
        address: poolReserve.underlyingAsset,
        decimals: poolReserve.decimals,
        symbol: poolReserve.symbol,
        image: !/_/.test(poolReserve.iconSymbol) ? underlyingBase64 : undefined,
      });
      setChangingNetwork(false);
    }
  }, [
    currentChainId,
    connectedChainId,
    changingNetwork,
    addERC20Token,
    poolReserve?.underlyingAsset,
    poolReserve?.decimals,
    poolReserve?.symbol,
    poolReserve?.iconSymbol,
    underlyingBase64,
  ]);

  if (!poolReserve) {
    return null;
  }

  return (
    <>
      {/* Load base64 token symbol for adding underlying and aTokens to wallet */}
      {poolReserve?.symbol && !/_/.test(poolReserve.symbol) && (
        <>
          <Base64Token
            symbol={poolReserve.iconSymbol}
            onImageGenerated={setUnderlyingBase64}
            aToken={false}
          />
          {!hideAToken && (
            <Base64Token
              symbol={poolReserve.iconSymbol}
              onImageGenerated={setATokenBase64}
              aToken={true}
            />
          )}
        </>
      )}
      <Box onClick={handleClick}>
        <CircleIcon tooltipText="Add token to wallet" downToSM={downToSM}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              '&:hover': {
                '.Wallet__icon': { opacity: '0 !important' },
                '.Wallet__iconHover': { opacity: '1 !important' },
              },
              cursor: 'pointer',
            }}
          >
            <WalletIcon sx={{ width: '14px', height: '14px', '&:hover': { stroke: '#F1F1F3' } }} />
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
      >
        <Box sx={{ px: '16px', py: '12px', width: '240px' }}>
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
                setChangingNetwork(true);
              });
            } else {
              addERC20Token({
                address: poolReserve.underlyingAsset,
                decimals: poolReserve.decimals,
                symbol: poolReserve.symbol,
                image: !/_/.test(poolReserve.symbol) ? underlyingBase64 : undefined,
              });
            }
            handleClose();
          }}
        >
          <TokenIcon symbol={poolReserve.iconSymbol} sx={{ fontSize: '20px' }} />
          <Typography variant="subheader1" sx={{ ml: 3 }} noWrap data-cy={`assetName`}>
            {poolReserve.symbol}
          </Typography>
        </MenuItem>

        {!hideAToken && (
          <MenuItem
            key="atoken"
            value="atoken"
            onClick={() => {
              if (currentChainId !== connectedChainId) {
                switchNetwork(currentChainId).then(() => {
                  setChangingNetwork(true);
                });
              } else {
                addERC20Token({
                  address: poolReserve.aTokenAddress,
                  decimals: poolReserve.decimals,
                  symbol: `a${poolReserve.symbol}`,
                  image: !/_/.test(poolReserve.symbol) ? aTokenBase64 : undefined,
                });
              }
              handleClose();
            }}
          >
            <TokenIcon symbol={poolReserve.iconSymbol} sx={{ fontSize: '20px' }} aToken={true} />
            <Typography variant="subheader1" sx={{ ml: 3 }} noWrap data-cy={`assetName`}>
              {`a${poolReserve.symbol}`}
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};
