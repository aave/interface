import { Trans } from '@lingui/macro';
import { Box, Menu, MenuItem, SvgIcon, Typography } from '@mui/material';
import * as React from 'react';
import { useState } from 'react';
import { CircleIcon } from 'src/components/CircleIcon';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

interface CopyAddressDropdownProps {
  poolReserve: ComputedReserveData;
  downToSM: boolean;
}

enum TokenType {
  UNDERLYING,
  ATOKEN,
  VARDEBT,
  STABLEDEBT,
}

export const CopyAddressDropdown = ({ poolReserve, downToSM }: CopyAddressDropdownProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [copyClicked, setCopyClicked] = useState<boolean>(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  // Copy token address to clipboard and display check for 1000ms
  const copyClick = async (token: TokenType) => {
    switch (token) {
      case TokenType.UNDERLYING: {
        navigator.clipboard.writeText(poolReserve.underlyingAsset);
        break;
      }
      case TokenType.ATOKEN: {
        navigator.clipboard.writeText(poolReserve.aTokenAddress);
        break;
      }
      case TokenType.VARDEBT: {
        navigator.clipboard.writeText(poolReserve.variableDebtTokenAddress);
        break;
      }
      case TokenType.STABLEDEBT: {
        navigator.clipboard.writeText(poolReserve.stableDebtTokenAddress);
        break;
      }
    }
    setCopyClicked(true);
    handleClose();
    await delay(1000);
    setCopyClicked(false);
  };

  return (
    <>
      <Box onClick={handleClick}>
        <CircleIcon
          tooltipText={copyClicked ? 'Copied' : 'Copy contract address'}
          downToSM={downToSM}
        >
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
              {copyClicked ? <CheckIcon /> : <ContentCopyIcon />}
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
            <Trans>Select token address to copy</Trans>
          </Typography>
        </Box>

        <MenuItem
          key="underlying"
          value="underlying"
          onClick={() => {
            copyClick(TokenType.UNDERLYING);
          }}
        >
          <Typography variant="subheader1" sx={{ ml: 3 }} noWrap data-cy={`assetName`}>
            {poolReserve.symbol}
          </Typography>
        </MenuItem>

        <MenuItem
          key="aToken"
          value="aToken"
          onClick={() => {
            copyClick(TokenType.ATOKEN);
          }}
        >
          <Typography variant="subheader1" sx={{ ml: 3 }} noWrap data-cy={`assetName`}>
            {'a' + poolReserve.symbol}
          </Typography>
        </MenuItem>
        {poolReserve.borrowingEnabled && (
          <MenuItem
            key="varDebt"
            value="varDebt"
            onClick={() => {
              copyClick(TokenType.VARDEBT);
            }}
          >
            <Typography variant="subheader1" sx={{ ml: 3 }} noWrap data-cy={`assetName`}>
              {'variableDebt' + poolReserve.symbol}
            </Typography>
          </MenuItem>
        )}
        {poolReserve.stableBorrowRateEnabled && (
          <MenuItem
            key="stableDebt"
            value="stableDebt"
            onClick={() => {
              copyClick(TokenType.STABLEDEBT);
            }}
          >
            <Typography variant="subheader1" sx={{ ml: 3 }} noWrap data-cy={`assetName`}>
              {'stableDebt' + poolReserve.symbol}
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};
