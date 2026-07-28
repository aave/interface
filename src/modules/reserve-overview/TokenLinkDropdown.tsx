import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Divider, Menu, MenuItem, SvgIcon } from '@mui/material';
import * as React from 'react';
import { useState } from 'react';
import { CircleIcon } from 'src/components/CircleIcon';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

import { RESERVE_DETAILS } from '../../utils/events';
import { MenuSectionLabel, TokenMenuItemContent } from './TokenMenuItems';

interface TokenLinkDropdownProps {
  poolReserve: ReserveWithId;
  iconSymbol?: string;
  downToSM: boolean;
  hideAToken?: boolean;
  hideVariableDebtToken?: boolean;
}

export const TokenLinkDropdown = ({
  poolReserve,
  iconSymbol,
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
    !!poolReserve.borrowInfo &&
    (poolReserve.borrowInfo.borrowingState !== 'DISABLED' ||
      Number(poolReserve.borrowInfo.total.amount.value) > 0 ||
      !!poolReserve.eModeInfo?.some((eMode) => eMode.canBeBorrowed));

  return (
    <>
      <Box onClick={handleClick}>
        <CircleIcon tooltipText={'View token contracts'} downToSM={downToSM}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              color: 'fg-3',
              '&:hover': { color: 'fg-1' },
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
        <MenuSectionLabel>
          <Trans>Underlying token</Trans>
        </MenuSectionLabel>

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
        >
          <TokenMenuItemContent
            symbol={iconSymbol ?? poolReserve.underlyingToken.symbol}
            label={poolReserve.underlyingToken.symbol}
          />
        </MenuItem>

        {!hideAToken && (
          <>
            <Divider />
            <MenuSectionLabel>
              <Trans>Aave aToken</Trans>
            </MenuSectionLabel>

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
            >
              <TokenMenuItemContent
                symbol={iconSymbol ?? poolReserve.underlyingToken.symbol}
                aToken={true}
                label={poolReserve.aToken.symbol}
              />
            </MenuItem>
          </>
        )}

        {showVariableDebtToken && (
          <>
            <Divider />
            <MenuSectionLabel>
              <Trans>Aave debt token</Trans>
            </MenuSectionLabel>
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
              <TokenMenuItemContent
                symbol={iconSymbol ?? poolReserve.underlyingToken.symbol}
                waToken={true}
                label={poolReserve.vToken.symbol}
              />
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};
