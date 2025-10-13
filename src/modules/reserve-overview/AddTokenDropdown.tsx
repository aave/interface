import { Trans } from '@lingui/macro';
import { Box, Menu, MenuItem, Typography } from '@mui/material';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { CircleIcon } from 'src/components/CircleIcon';
import { WalletIcon } from 'src/components/icons/WalletIcon';
import { Base64Token, TokenIcon } from 'src/components/primitives/TokenIcon';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ERC20TokenType } from 'src/libs/web3-data-provider/Web3Provider';
import { useRootStore } from 'src/store/root';
import { RESERVE_DETAILS } from 'src/utils/events';

interface AddTokenDropdownProps {
  poolReserve: ReserveWithId;
  downToSM: boolean;
  switchNetwork: (chainId: number) => Promise<void>;
  addERC20Token: (args: ERC20TokenType) => Promise<boolean>;
  currentChainId: number;
  connectedChainId: number;
  hideAToken?: boolean;
  isSGHO?: boolean;
  sGHOTokenAddress?: string;
}

export const AddTokenDropdown = ({
  poolReserve,
  downToSM,
  switchNetwork,
  addERC20Token,
  currentChainId,
  connectedChainId,
  hideAToken,
  isSGHO,
  sGHOTokenAddress,
}: AddTokenDropdownProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [changingNetwork, setChangingNetwork] = useState(false);
  const [underlyingBase64, setUnderlyingBase64] = useState('');
  const [aTokenBase64, setATokenBase64] = useState('');
  const [sGHOBase64, setSGHOBase64] = useState('');
  const open = Boolean(anchorEl);
  const trackEvent = useRootStore((store) => store.trackEvent);

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
        address: poolReserve.underlyingToken.address,
        decimals: poolReserve.underlyingToken.decimals,
        symbol: poolReserve.underlyingToken.symbol,
        image: !/_/.test(poolReserve.underlyingToken.symbol.toLocaleUpperCase())
          ? underlyingBase64
          : undefined,
      });
      setChangingNetwork(false);
    }
  }, [
    currentChainId,
    connectedChainId,
    changingNetwork,
    addERC20Token,
    poolReserve?.underlyingToken.address,
    poolReserve?.underlyingToken.decimals,
    poolReserve?.underlyingToken.symbol,
    poolReserve?.underlyingToken.imageUrl,
    underlyingBase64,
  ]);

  if (!poolReserve) {
    return null;
  }

  return (
    <>
      {/* Load base64 token symbol for adding underlying and aTokens to wallet */}
      {poolReserve?.underlyingToken.symbol && !/_/.test(poolReserve.underlyingToken.symbol) && (
        <>
          <Base64Token
            symbol={poolReserve.underlyingToken.symbol.toUpperCase()}
            onImageGenerated={setUnderlyingBase64}
            aToken={false}
          />
          {!hideAToken && (
            <Base64Token
              symbol={poolReserve.underlyingToken.symbol.toUpperCase()}
              onImageGenerated={setATokenBase64}
              aToken={true}
            />
          )}
          {isSGHO && <Base64Token symbol="sgho" onImageGenerated={setSGHOBase64} aToken={false} />}
        </>
      )}
      <Box onClick={handleClick}>
        <CircleIcon tooltipText="Add token to wallet" downToSM={downToSM}>
          <Box
            onClick={() => {
              trackEvent(RESERVE_DETAILS.ADD_TOKEN_TO_WALLET_DROPDOWN, {
                asset: poolReserve.underlyingToken.address,
                assetName: poolReserve.underlyingToken.name,
              });
            }}
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
        <Box sx={{ px: 4, pt: 3, pb: 2 }}>
          <Typography variant="secondary12" color="text.secondary">
            <Trans>Underlying token</Trans>
          </Typography>
        </Box>

        <MenuItem
          key="underlying"
          value="underlying"
          divider
          onClick={() => {
            if (currentChainId !== connectedChainId) {
              switchNetwork(currentChainId).then(() => {
                setChangingNetwork(true);
              });
            } else {
              trackEvent(RESERVE_DETAILS.ADD_TO_WALLET, {
                type: 'Underlying token',
                asset: poolReserve.underlyingToken.address,
                assetName: poolReserve.underlyingToken.name,
              });

              addERC20Token({
                address: poolReserve.underlyingToken.address,
                decimals: poolReserve.underlyingToken.decimals,
                symbol: poolReserve.underlyingToken.symbol,
                image: !/_/.test(poolReserve.underlyingToken.symbol.toUpperCase())
                  ? underlyingBase64
                  : undefined,
              });
            }
            handleClose();
          }}
        >
          <TokenIcon symbol={poolReserve.underlyingToken.symbol} sx={{ fontSize: '20px' }} />
          <Typography variant="subheader1" sx={{ ml: 3 }} noWrap data-cy={`assetName`}>
            {poolReserve.underlyingToken.symbol}
          </Typography>
        </MenuItem>
        {!hideAToken && (
          <Box>
            <Box sx={{ px: 4, pt: 3, pb: 2 }}>
              <Typography variant="secondary12" color="text.secondary">
                <Trans>Aave aToken</Trans>
              </Typography>
            </Box>
            <MenuItem
              key="atoken"
              value="atoken"
              onClick={() => {
                if (currentChainId !== connectedChainId) {
                  switchNetwork(currentChainId).then(() => {
                    setChangingNetwork(true);
                  });
                } else {
                  trackEvent(RESERVE_DETAILS.ADD_TO_WALLET, {
                    asset: poolReserve.underlyingToken.address,
                    assetName: poolReserve.underlyingToken.name,
                  });

                  addERC20Token({
                    address: poolReserve.aToken.address,
                    decimals: poolReserve.aToken.decimals,
                    symbol: '',
                    image: !/_/.test(poolReserve.underlyingToken.symbol) ? aTokenBase64 : undefined,
                  });
                }
                handleClose();
              }}
            >
              <TokenIcon
                symbol={poolReserve.underlyingToken.symbol}
                sx={{ fontSize: '20px' }}
                aToken={true}
              />
              <Typography variant="subheader1" sx={{ ml: 3 }} noWrap data-cy={`assetName`}>
                {poolReserve.aToken.symbol}
              </Typography>
            </MenuItem>
          </Box>
        )}
        {isSGHO && sGHOTokenAddress && (
          <Box>
            <Box sx={{ px: 4, pt: 3, pb: 2 }}>
              <Typography variant="secondary12" color="text.secondary">
                <Trans>Savings GHO token</Trans>
              </Typography>
            </Box>
            <MenuItem
              key="sgho"
              value="sgho"
              onClick={() => {
                if (currentChainId !== connectedChainId) {
                  switchNetwork(currentChainId).then(() => {
                    setChangingNetwork(true);
                  });
                } else {
                  trackEvent(RESERVE_DETAILS.ADD_TO_WALLET, {
                    type: 'Savings GHO token',
                    asset: sGHOTokenAddress,
                    assetName: 'sGHO',
                  });

                  addERC20Token({
                    address: sGHOTokenAddress,
                    decimals: poolReserve.underlyingToken.decimals,
                    symbol: `stkGHO`, // TODO: change to sGHO when upgraded contract is deployed
                    image: sGHOBase64,
                  });
                }
                handleClose();
              }}
            >
              <TokenIcon symbol="sgho" sx={{ fontSize: '20px' }} />
              <Typography variant="subheader1" sx={{ ml: 3 }} noWrap data-cy={`assetName`}>
                sGHO
              </Typography>
            </MenuItem>
          </Box>
        )}
      </Menu>
    </>
  );
};
