import { isAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';
import { ExclamationIcon } from '@heroicons/react/outline';
import { XCircleIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { ExpandMore } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputBase,
  ListItemText,
  MenuItem,
  SvgIcon,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import NumberFormat, { NumberFormatProps } from 'react-number-format';
import { TokenInfoWithBalance } from 'src/hooks/generic/useTokensBalance';
import { useRootStore } from 'src/store/root';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { COMMON_SWAPS } from '../../../ui-config/TokenList';
import { BasicModal } from '../../primitives/BasicModal';
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
  forcedMaxValue?: string;
  loading?: boolean;
  selectedAsset: TokenInfoWithBalance;
  balanceTitle?: string;
  showBalance?: boolean;
  allowCustomTokens?: boolean;
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
  forcedMaxValue,
  loading = false,
  chainId,
  selectedAsset,
  balanceTitle,
  showBalance = true,
  allowCustomTokens = true,
}: AssetInputProps) => {
  const theme = useTheme();
  const handleSelect = (asset: TokenInfoWithBalance) => {
    onSelect && onSelect(asset);
    onChange && onChange('');
    handleClose();
  };

  const { erc20Service } = useSharedDependencies();

  const [openModal, setOpenModal] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (!allowCustomTokens && assets.length === 1) return;
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    handleCleanSearch();
  };

  const [filteredAssets, setFilteredAssets] = useState(assets);
  const [loadingNewAsset, setLoadingNewAsset] = useState(false);
  const user = useRootStore((store) => store.account);

  useEffect(() => {
    setFilteredAssets(assets);
  }, [assets]);

  const popularAssets = assets.filter((asset) => COMMON_SWAPS.includes(asset.symbol));
  const handleSearchAssetChange = (value: string) => {
    const searchQuery = value.trim().toLowerCase();
    const matchingAssets = assets.filter(
      (asset) =>
        asset.symbol.toLowerCase().includes(searchQuery) ||
        asset.name.toLowerCase().includes(searchQuery) ||
        asset.address.toLowerCase() === searchQuery
    );
    if (matchingAssets.length === 0) {
      // If custom tokens are not allowed, do not attempt to import by address
      if (!allowCustomTokens) {
        setLoadingNewAsset(false);
        setFilteredAssets([]);
        return;
      }

      if (isAddress(value)) {
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
        return;
      }

      setFilteredAssets([]);
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
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '6px',
        overflow: 'hidden',
        px: 3,
        py: 2,
        width: '100%',
      })}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                width: '100%',
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
          sx={{
            p: 0,
            borderRadius: '6px',
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: 'transparent',
            },
          }}
          endIcon={assets.length > 1 ? <ExpandMore /> : undefined}
        >
          <ExternalTokenIcon
            symbol={selectedAsset.symbol}
            logoURI={selectedAsset.logoURI}
            sx={{ mr: 2, ml: 3, fontSize: '24px' }}
          />
          <Typography
            data-cy={`assetsSelectedOption_${selectedAsset.symbol.toUpperCase()}`}
            variant="main16"
            color="text.primary"
            sx={{ fontWeight: 500 }}
          >
            {selectedAsset.symbol}
          </Typography>
          {selectedAsset.extensions?.isUserCustom && (
            <SvgIcon sx={{ fontSize: 16, ml: 1 }} color="warning">
              <ExclamationIcon />
            </SvgIcon>
          )}
        </Button>

        <BasicModal
          BackdropProps={{
            style: { backgroundColor: 'transparent' },
          }}
          open={openModal}
          setOpen={setOpenModal}
          contentMaxWidth={420}
          contentHeight={680}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="main16" sx={{ fontSize: 18, fontWeight: 600, mb: 3 }}>
              <Trans>Select token</Trans>
            </Typography>

            <Box
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                position: 'sticky',
                top: 0,
                zIndex: 2,
                mb: 3,
                pb: 3,
                backgroundColor: theme.palette.background.paper,
                boxShadow: '0px 4px 6px -6px rgba(0, 0, 0, 0.1)',
                marginTop: -3,
                paddingTop: 3,
              }}
            >
              <SearchInput
                onSearchTermChange={handleSearchAssetChange}
                placeholder={allowCustomTokens ? 'Search name or paste address' : 'Search name'}
                disableFocus={true}
              />
              {assets.length > 3 && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    mt: 2.5,
                    gap: 1.5,
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
                        transition: 'all 0.2s ease',
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
              )}
            </Box>
            <Box
              sx={{
                flexGrow: 1,
                overflowY: 'auto',
                maxHeight: 'calc(600px - 180px)',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: theme.palette.divider,
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: theme.palette.action.hover,
                },
              }}
            >
              {loadingNewAsset ? (
                <Box
                  sx={{
                    maxHeight: '220px',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '80px',
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
                      py: 1.5,
                      px: 3,
                      borderRadius: '8px',
                      my: 0.5,
                      '&:hover': {
                        backgroundColor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.03)',
                      },
                    }}
                    onClick={() => handleSelect(asset)}
                  >
                    <ExternalTokenIcon
                      symbol={asset.symbol}
                      logoURI={asset.logoURI}
                      sx={{ mr: 2, width: 28, height: 28 }}
                    />
                    <ListItemText
                      sx={{ flexGrow: 0 }}
                      primary={
                        <Typography variant="main16" fontWeight={500}>
                          {asset.symbol}
                        </Typography>
                      }
                    />
                    {asset.extensions?.isUserCustom && (
                      <SvgIcon sx={{ fontSize: 16, ml: 1 }} color="warning">
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
                  {allowCustomTokens ? (
                    <Trans>
                      No results found. You can import a custom token with a contract address
                    </Trans>
                  ) : (
                    <Trans>No results found.</Trans>
                  )}
                </Typography>
              )}
            </Box>
          </Box>
        </BasicModal>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', height: '20px', mt: 0.5 }}>
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

        {showBalance && selectedAsset.balance && (
          <>
            <Typography component="div" variant="secondary12" color="text.secondary">
              <Trans>{balanceTitle || 'Balance'}</Trans>
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
                  onChange && onChange(forcedMaxValue || '-1');
                }}
                disabled={
                  disabled ||
                  Number(selectedAsset.balance) === 0 ||
                  Number(value) === Number(forcedMaxValue) ||
                  Number(value) === Number(selectedAsset.balance) ||
                  (!!forcedMaxValue && Number(selectedAsset.balance) < Number(forcedMaxValue))
                }
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
