import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Menu, MenuItem, SvgIcon, Typography } from '@mui/material';
import * as React from 'react';
import { useState } from 'react';
import { CircleIcon } from 'src/components/CircleIcon';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

import { RESERVE_DETAILS } from '../../utils/events';

interface TokenLinkDropdownProps {
  poolReserve: ReserveWithId;
  downToSM: boolean;
  hideAToken?: boolean;
  hideVariableDebtToken?: boolean;
}

export const TokenLinkDropdown = ({
  poolReserve,
  downToSM,
  hideAToken,
  hideVariableDebtToken,
}: TokenLinkDropdownProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const [trackEvent, currentNetworkConfig, currentMarket] = useRootStore(
    useShallow((store) => [store.trackEvent, store.currentNetworkConfig, store.currentMarket])
  );

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    trackEvent(RESERVE_DETAILS.RESERVE_TOKENS_DROPDOWN, {
      assetName: poolReserve.underlyingToken.name,
      asset: poolReserve.underlyingToken.address,
      aToken: poolReserve.aToken.address,
      market: currentMarket,
      variableDebtToken: poolReserve.vToken.address,
    });
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  if (!poolReserve) {
    return null;
  }

  const showVariableDebtToken =
    !hideVariableDebtToken &&
    (poolReserve.borrowInfo?.borrowingState === 'ENABLED' ||
      Number(poolReserve.borrowInfo?.total.amount.value) > 0);

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
        <Box sx={{ px: 4, pt: 3, pb: 2 }}>
          <Typography variant="secondary12" color="text.secondary">
            <Trans>Underlying token</Trans>
          </Typography>
        </Box>

        <MenuItem
          onClick={() => {
            trackEvent(RESERVE_DETAILS.RESERVE_TOKEN_ACTIONS, {
              type: 'Underlying Token',
              assetName: poolReserve.underlyingToken.name,
              asset: poolReserve.underlyingToken.address,
              aToken: poolReserve.aToken.address,
              market: currentMarket,
              variableDebtToken: poolReserve.vToken.address,
            });
          }}
          component="a"
          href={currentNetworkConfig.explorerLinkBuilder({
            address: poolReserve?.underlyingToken.address.toLowerCase(),
          })}
          target="_blank"
          divider={showVariableDebtToken}
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
              component="a"
              onClick={() => {
                trackEvent(RESERVE_DETAILS.RESERVE_TOKEN_ACTIONS, {
                  type: 'aToken',
                  assetName: poolReserve.underlyingToken.name,
                  asset: poolReserve.underlyingToken.address,
                  aToken: poolReserve.aToken.address,
                  market: currentMarket,
                  variableDebtToken: poolReserve.vToken.address,
                });
              }}
              href={currentNetworkConfig.explorerLinkBuilder({
                address: poolReserve?.aToken.address.toLocaleLowerCase(),
              })}
              target="_blank"
              divider={showVariableDebtToken}
            >
              <TokenIcon
                symbol={poolReserve.underlyingToken.symbol}
                aToken={true}
                sx={{ fontSize: '20px' }}
              />
              <Typography variant="subheader1" sx={{ ml: 3 }} noWrap data-cy={`assetName`}>
                {poolReserve.aToken.symbol}
              </Typography>
            </MenuItem>
          </Box>
        )}

        {showVariableDebtToken && (
          <Box sx={{ px: 4, pt: 3, pb: 2 }}>
            <Typography variant="secondary12" color="text.secondary">
              <Trans>Aave debt token</Trans>
            </Typography>
          </Box>
        )}
        {showVariableDebtToken && (
          <MenuItem
            component="a"
            href={currentNetworkConfig.explorerLinkBuilder({
              address: poolReserve?.vToken.address.toLocaleLowerCase(),
            })}
            target="_blank"
            onClick={() => {
              trackEvent(RESERVE_DETAILS.RESERVE_TOKEN_ACTIONS, {
                type: 'Variable Debt',
                assetName: poolReserve.underlyingToken.name,
                asset: poolReserve.underlyingToken.address,
                aToken: poolReserve.aToken.address,
                market: currentMarket,
                variableDebtToken: poolReserve.vToken.address,
              });
            }}
          >
            <TokenIcon
              symbol={poolReserve.underlyingToken.symbol}
              waToken={true} //TODO: get a specific icon for variable debt token or apply waToken style
              sx={{ fontSize: '20px' }}
            />
            <Typography variant="subheader1" sx={{ ml: 3 }} noWrap data-cy={`assetName`}>
              {poolReserve.vToken.symbol}
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};
