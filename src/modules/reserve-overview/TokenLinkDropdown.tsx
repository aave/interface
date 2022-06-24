import { Trans } from '@lingui/macro';
import { Box, Menu, MenuItem, SvgIcon, Typography } from '@mui/material';
import * as React from 'react';
import { useState } from 'react';
import { CircleIcon } from 'src/components/CircleIcon';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Link } from 'src/components/primitives/Link';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

interface TokenLinkDropdownProps {
  poolReserve: ComputedReserveData;
  downToSM: boolean;
}

export const TokenLinkDropdown = ({ poolReserve, downToSM }: TokenLinkDropdownProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { currentNetworkConfig } = useProtocolDataContext();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box onClick={handleClick}>
        <CircleIcon tooltipText={'View token contracts'} downToSM={downToSM}>
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
              <ExternalLinkIcon />
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
      >
        <Box sx={{ px: '16px', py: '12px', width: '240px' }}>
          <Typography variant="secondary12" color="text.secondary">
            <Trans>Select token to view in block explorer</Trans>
          </Typography>
        </Box>

        <MenuItem key="underlying" value="underlying">
          <Link
            href={currentNetworkConfig.explorerLinkBuilder({
              address: poolReserve?.underlyingAsset,
            })}
            sx={{ display: 'flex' }}
          >
            <TokenIcon symbol={poolReserve.iconSymbol} sx={{ fontSize: '20px' }} />
            <Typography variant="subheader1" sx={{ ml: 3 }} noWrap data-cy={`assetName`}>
              {poolReserve.symbol}
            </Typography>
          </Link>
        </MenuItem>

        <MenuItem key="aToken" value="aToken">
          <Link
            href={currentNetworkConfig.explorerLinkBuilder({
              address: poolReserve?.aTokenAddress,
            })}
            sx={{ display: 'flex' }}
          >
            <TokenIcon symbol={poolReserve.iconSymbol} aToken={true} sx={{ fontSize: '20px' }} />
            <Typography variant="subheader1" sx={{ ml: 3 }} noWrap data-cy={`assetName`}>
              {'a' + poolReserve.symbol}
            </Typography>
          </Link>
        </MenuItem>
        {poolReserve.borrowingEnabled && (
          <MenuItem key="varDebt" value="varDebt">
            <Link
              href={currentNetworkConfig.explorerLinkBuilder({
                address: poolReserve?.variableDebtTokenAddress,
              })}
              sx={{ display: 'flex' }}
            >
              <TokenIcon symbol="default" sx={{ fontSize: '20px' }} />
              <Typography variant="subheader1" sx={{ ml: 3 }} noWrap data-cy={`assetName`}>
                {'Variable debt ' + poolReserve.symbol}
              </Typography>
            </Link>
          </MenuItem>
        )}
        {poolReserve.stableBorrowRateEnabled && (
          <MenuItem key="stableDebt" value="stableDebt">
            <Link
              href={currentNetworkConfig.explorerLinkBuilder({
                address: poolReserve?.stableDebtTokenAddress,
              })}
              sx={{ display: 'flex' }}
            >
              <TokenIcon symbol="default" sx={{ fontSize: '20px' }} />
              <Typography variant="subheader1" sx={{ ml: 3 }} noWrap data-cy={`assetName`}>
                {'Stable debt ' + poolReserve.symbol}
              </Typography>
            </Link>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};
