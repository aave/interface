import { isAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';
import { ExclamationIcon } from '@heroicons/react/outline';
import { XCircleIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputBase,
  ListItemText,
  Menu,
  MenuItem,
  SvgIcon,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useRef, useState } from 'react';
import NumberFormat, { NumberFormatProps } from 'react-number-format';
import { TokenInfoWithBalance } from 'src/hooks/generic/useTokensBalance';
import { useRootStore } from 'src/store/root';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { COMMON_SWAPS } from '../../../ui-config/TokenList';
import { FormattedNumber } from '../../primitives/FormattedNumber';
import { ExternalTokenIcon } from '../../primitives/TokenIcon';
import { SearchInput } from '../../SearchInput';

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
  value: string;
}

export const NumberFormatCustom = React.forwardRef<NumberFormatProps, CustomProps>(
  function NumberFormatCustom(props, ref) {
    const { onChange, ...other } = props;

    return (
      <NumberFormat
        {...other}
        getInputRef={ref}
        onValueChange={(values) => {
          if (values.value !== props.value)
            onChange({
              target: {
                name: props.name,
                value: values.value || '',
              },
            });
        }}
        thousandSeparator
        isNumericString
        allowNegative={false}
      />
    );
  }
);

export interface AssetInputProps {
  value: string;
  usdValue: string;
  chainId: number;
  onChange?: (value: string) => void;
  disabled?: boolean;
  disableInput?: boolean;
  onSelect?: (asset: TokenInfoWithBalance) => void;
  assets: TokenInfoWithBalance[];
  maxValue?: string;
  isMaxSelected?: boolean;
  loading?: boolean;
  selectedAsset: TokenInfoWithBalance;
}

export const SwitchAssetInput = ({
  value,
  usdValue,
  onChange,
  disabled,
  disableInput,
  onSelect,
  assets,
  maxValue,
  isMaxSelected,
  loading = false,
  chainId,
  selectedAsset,
}: AssetInputProps) => {
  const theme = useTheme();
  const handleSelect = (asset: TokenInfoWithBalance) => {
    onSelect && onSelect(asset);
    onChange && onChange('');
    handleClose();
  };

  const { erc20Service } = useSharedDependencies();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = () => {
    setAnchorEl(inputRef.current);
  };
  const handleClose = () => {
    setAnchorEl(null);
    handleCleanSearch();
  };

  const [filteredAssets, setFilteredAssets] = useState(assets);
  const [loadingNewAsset, setLoadingNewAsset] = useState(false);
  const user = useRootStore((store) => store.account);

  const popularAssets = assets.filter((asset) => COMMON_SWAPS.includes(asset.symbol));
  const handleSearchAssetChange = (value: string) => {
    const searchQuery = value.trim().toLowerCase();
    const matchingAssets = assets.filter(
      (asset) =>
        asset.symbol.toLowerCase().includes(searchQuery) ||
        asset.name.toLowerCase().includes(searchQuery) ||
        asset.address.toLowerCase() === searchQuery
    );
    if (matchingAssets.length === 0 && isAddress(value)) {
      setLoadingNewAsset(true);
      Promise.all([
        erc20Service.getTokenInfo(value, chainId),
        erc20Service.getBalance(value, user, chainId),
      ])
        .then(([tokenMetadata, userBalance]) => {
          const tokenInfo = {
            chainId: chainId,
            balance: formatUnits(userBalance, tokenMetadata.decimals),
            extensions: {
              isUserCustom: true,
            },
            ...tokenMetadata,
          };
          setFilteredAssets([tokenInfo]);
        })
        .catch(() => setFilteredAssets([]))
        .finally(() => setLoadingNewAsset(false));
    } else {
      setFilteredAssets(matchingAssets);
    }
  };

  const handleCleanSearch = () => {
    setFilteredAssets(assets);
    setLoadingNewAsset(false);
  };

  return (
    <Box
      ref={inputRef}
      sx={(theme) => ({
        p: '8px 12px',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '6px',
        width: '100%',
        mb: 1,
      })}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
        {loading ? (
          <Box sx={{ flex: 1 }}>
            <CircularProgress color="inherit" size="16px" />
          </Box>
        ) : (
          <InputBase
            sx={{ flex: 1 }}
            placeholder="0.00"
            disabled={disabled || disableInput}
            value={value}
            autoFocus
            onChange={(e) => {
              if (!onChange) return;
              if (Number(e.target.value) > Number(maxValue)) {
                onChange('-1');
              } else {
                onChange(e.target.value);
              }
            }}
            inputProps={{
              'aria-label': 'amount input',
              style: {
                fontSize: '21px',
                lineHeight: '28,01px',
                padding: 0,
                height: '28px',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              },
            }}
            // eslint-disable-next-line
            inputComponent={NumberFormatCustom as any}
          />
        )}
        {value !== '' && !disableInput && (
          <IconButton
            sx={{
              minWidth: 0,
              p: 0,
              left: 8,
              zIndex: 1,
              color: 'text.muted',
              '&:hover': {
                color: 'text.secondary',
              },
            }}
            onClick={() => {
              onChange && onChange('');
            }}
            disabled={disabled}
          >
            <XCircleIcon height={16} />
          </IconButton>
        )}
        <Button
          disableRipple
          onClick={handleClick}
          data-cy={`assetSelect`}
          sx={{ p: 0, '&:hover': { backgroundColor: 'transparent' } }}
          endIcon={open ? <ExpandLess /> : <ExpandMore />}
        >
          <ExternalTokenIcon
            symbol={selectedAsset.symbol}
            logoURI={selectedAsset.logoURI}
            sx={{ mr: 2, ml: 3 }}
          />
          <Typography
            data-cy={`assetsSelectedOption_${selectedAsset.symbol.toUpperCase()}`}
            variant="main16"
            color="text.primary"
          >
            {selectedAsset.symbol}
          </Typography>
          {selectedAsset.extensions?.isUserCustom && (
            <SvgIcon sx={{ fontSize: 14, ml: 1 }} color="warning">
              <ExclamationIcon />
            </SvgIcon>
          )}
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              width: inputRef.current?.offsetWidth,
              border: theme.palette.mode === 'dark' ? '1px solid #EBEBED1F' : 'unset',
              boxShadow: '0px 2px 10px 0px #0000001A',
              overflow: 'hidden',
            },
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Box
            sx={{
              p: 2,
              px: 3,
              borderBottom: `1px solid ${theme.palette.divider}`,
              top: 0,
              zIndex: 2,
            }}
          >
            <SearchInput
              onSearchTermChange={handleSearchAssetChange}
              placeholder="Search name or paste address"
              disableFocus={true}
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                overfloyY: 'auto',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                mt: 2,
                gap: 2,
              }}
            >
              {popularAssets.map((asset) => (
                <Box
                  key={asset.symbol}
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    p: 1,
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.palette.divider,
                    },
                  }}
                  onClick={() => handleSelect(asset)}
                >
                  <ExternalTokenIcon
                    logoURI={asset.logoURI}
                    symbol={asset.symbol}
                    sx={{ width: 24, height: 24, mr: 1 }}
                  />
                  <Typography variant="main14" color="text.primary" sx={{ mr: 1 }}>
                    {asset.symbol}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
          <Box sx={{ overflow: 'auto', maxHeight: '200px' }}>
            {loadingNewAsset ? (
              <Box
                sx={{
                  maxHeight: '178px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '60px',
                }}
              >
                <CircularProgress sx={{ mx: 'auto', my: 'auto' }} />
              </Box>
            ) : filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => (
                <MenuItem
                  key={asset.symbol}
                  value={asset.symbol}
                  data-cy={`assetsSelectOption_${asset.symbol.toUpperCase()}`}
                  sx={{
                    backgroundColor: theme.palette.background.paper,
                  }}
                  onClick={() => handleSelect(asset)}
                >
                  <ExternalTokenIcon symbol={asset.symbol} logoURI={asset.logoURI} sx={{ mr: 2 }} />
                  <ListItemText sx={{ flexGrow: 0 }}>{asset.symbol}</ListItemText>
                  {asset.extensions?.isUserCustom && (
                    <SvgIcon sx={{ fontSize: 14, ml: 1 }} color="warning">
                      <ExclamationIcon />
                    </SvgIcon>
                  )}
                  {asset.balance && (
                    <FormattedNumber sx={{ ml: 'auto' }} value={asset.balance} compact />
                  )}
                </MenuItem>
              ))
            ) : (
              <Typography
                variant="main14"
                color="text.primary"
                sx={{ width: 'auto', textAlign: 'center', m: 4 }}
              >
                <Trans>
                  No results found. You can import a custom token with a contract address
                </Trans>
              </Typography>
            )}
          </Box>
        </Menu>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', height: '16px' }}>
        {loading ? (
          <Box sx={{ flex: 1 }} />
        ) : (
          <FormattedNumber
            value={isNaN(Number(usdValue)) ? 0 : Number(usdValue)}
            compact
            symbol="USD"
            variant="secondary12"
            color="text.muted"
            symbolsColor="text.muted"
            flexGrow={1}
          />
        )}

        {selectedAsset.balance && onChange && (
          <>
            <Typography component="div" variant="secondary12" color="text.secondary">
              <Trans>Balance</Trans>
              <FormattedNumber
                value={selectedAsset.balance}
                compact
                variant="secondary12"
                color="text.secondary"
                symbolsColor="text.disabled"
                sx={{ ml: 1 }}
              />
            </Typography>
            {!disableInput && (
              <Button
                size="small"
                sx={{ minWidth: 0, ml: '7px', p: 0 }}
                onClick={() => {
                  onChange('-1');
                }}
                disabled={disabled || isMaxSelected}
              >
                <Trans>Max</Trans>
              </Button>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};
