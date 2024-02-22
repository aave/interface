import { XCircleIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import {
  Box,
  BoxProps,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputBase,
  ListItemText,
  MenuItem,
  Select,
  Typography,
  useTheme,
} from '@mui/material';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import NumberFormat, { NumberFormatProps } from 'react-number-format';
import { TrackEventProps } from 'src/store/analyticsSlice';
import { useRootStore } from 'src/store/root';
import invariant from 'tiny-invariant';

import { COMMON_SWAPS } from '../../../ui-config/TokenList';
import { CapType } from '../../caps/helper';
import { AvailableTooltip } from '../../infoTooltips/AvailableTooltip';
import { FormattedNumber } from '../../primitives/FormattedNumber';
import { ExternalTokenIcon, TokenIcon } from '../../primitives/TokenIcon';
import { SearchInput } from '../../SearchInput';
import { TokenInfoWithBalance } from './SwitchModal';

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
  symbol: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  disableInput?: boolean;
  onSelect?: (asset: TokenInfoWithBalance) => void;
  assets: TokenInfoWithBalance[];
  capType?: CapType;
  maxValue?: string;
  isMaxSelected?: boolean;
  inputTitle?: ReactNode;
  balanceText?: ReactNode;
  loading?: boolean;
  event?: TrackEventProps;
  selectOptionHeader?: ReactNode;
  selectOption?: (asset: TokenInfoWithBalance) => ReactNode;
  sx?: BoxProps;
}

export const SwitchAssetInput = ({
  value,
  usdValue,
  symbol,
  onChange,
  disabled,
  disableInput,
  onSelect,
  assets,
  capType,
  maxValue,
  isMaxSelected,
  inputTitle,
  balanceText,
  loading = false,
  event,
  selectOptionHeader,
  selectOption,
  sx = {},
}: AssetInputProps) => {
  const theme = useTheme();
  const trackEvent = useRootStore((store) => store.trackEvent);
  const handleSelect = (asset: TokenInfoWithBalance) => {
    onSelect && onSelect(asset);
    onChange && onChange('');
    handleCleanSearch();
    setSelectKey((prevKey) => prevKey + 1);
  };

  const [filteredAssets, setFilteredAssets] = useState(assets);
  const [selectKey, setSelectKey] = useState(0);

  const popularAssets = assets.filter((asset) => COMMON_SWAPS.includes(asset.symbol));
  const handleSearchAssetChange = (value: string) => {
    const searchQuery = value.trim().toLowerCase();
    const matchingAssets = assets.filter(
      (asset) =>
        asset.symbol.toLowerCase().includes(searchQuery) ||
        asset.name.toLowerCase().includes(searchQuery) ||
        asset.address.toLowerCase() === searchQuery
    );

    setFilteredAssets(matchingAssets);
  };

  const handleCleanSearch = () => {
    setFilteredAssets(assets);
  };

  const inputBoxRef = useRef<HTMLDivElement>(null);
  const [inputBoxWidth, setInputBoxWidth] = useState<number>(0);

  useEffect(() => {
    if (inputBoxRef.current) {
      setInputBoxWidth(inputBoxRef.current.offsetWidth);
    }
  }, []);

  const asset =
    assets.length === 1 ? assets[0] : assets && assets.find((asset) => asset.symbol === symbol);

  invariant(asset, 'Asset not found');

  return (
    <Box {...sx}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography color="text.secondary">
          {inputTitle ? inputTitle : <Trans>Amount</Trans>}
        </Typography>
        {capType && <AvailableTooltip capType={capType} />}
      </Box>

      <Box
        ref={inputBoxRef}
        sx={(theme) => ({
          p: '8px 12px',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '6px',
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
          {!onSelect || assets.length === 1 ? (
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <TokenIcon symbol={asset.symbol} sx={{ mr: 2, ml: 4 }} />
              <Typography variant="h3" sx={{ lineHeight: '28px' }} data-cy={'inputAsset'}>
                {symbol}
              </Typography>
            </Box>
          ) : (
            <FormControl>
              <Select
                key={selectKey}
                disabled={disabled}
                value={asset.symbol}
                onClose={handleCleanSearch}
                variant="outlined"
                className="AssetInput__select"
                data-cy={'assetSelect'}
                MenuProps={{
                  autoFocus: false,
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'right',
                  },
                  PaperProps: {
                    style: {
                      overflow: 'hidden',
                      width: inputBoxWidth,
                      transform: 'translateX(0.8rem) translateY(22px)',
                    },
                  },
                  sx: {
                    maxHeight: '350px',
                    '.MuiPaper-root': {
                      border: theme.palette.mode === 'dark' ? '1px solid #EBEBED1F' : 'unset',
                      boxShadow: '0px 2px 10px 0px #0000001A',
                    },
                  },
                  MenuListProps: {
                    subheader: (
                      <Box
                        sx={{
                          p: 2,
                          px: 3,
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          position: 'sticky',
                          top: 0,
                          zIndex: 2,
                          backgroundColor: theme.palette.background.paper,
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
                              <TokenIcon
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
                    ),
                  },
                }}
                sx={{
                  p: 0,
                  '&.AssetInput__select .MuiOutlinedInput-input': {
                    p: 0,
                    backgroundColor: 'transparent',
                    pr: '24px !important',
                  },
                  '&.AssetInput__select .MuiOutlinedInput-notchedOutline': { display: 'none' },
                  '&.AssetInput__select .MuiSelect-icon': {
                    color: 'text.primary',
                    right: '0%',
                  },
                }}
                renderValue={(symbol) => {
                  const asset =
                    assets.length === 1
                      ? assets[0]
                      : assets && assets.find((asset) => asset.symbol === symbol);
                  invariant(asset, 'Asset not found');
                  return (
                    <Box
                      sx={{ display: 'flex', alignItems: 'center' }}
                      data-cy={`assetsSelectedOption_${asset.symbol.toUpperCase()}`}
                    >
                      <ExternalTokenIcon
                        symbol={asset.symbol}
                        // aToken={asset.aToken}
                        logoURI={asset.logoURI}
                        sx={{ mr: 2, ml: 4 }}
                      />
                      <Typography variant="main16" color="text.primary">
                        {symbol}
                      </Typography>
                    </Box>
                  );
                }}
              >
                <Box
                  sx={{
                    maxHeight: '178px',
                    overflowY: 'auto',
                  }}
                >
                  {selectOptionHeader ? selectOptionHeader : undefined}
                  {filteredAssets.length > 0 ? (
                    filteredAssets.map((asset) => (
                      <MenuItem
                        key={asset.symbol}
                        value={asset.symbol}
                        data-cy={`assetsSelectOption_${asset.symbol.toUpperCase()}`}
                        onClick={() => handleSelect(asset)}
                      >
                        {selectOption ? (
                          selectOption(asset)
                        ) : (
                          <>
                            <ExternalTokenIcon
                              symbol={asset.symbol}
                              logoURI={asset.logoURI}
                              sx={{ mr: 2 }}
                            />
                            <ListItemText sx={{ mr: 6 }}>{asset.symbol}</ListItemText>
                            {asset.balance && <FormattedNumber value={asset.balance} compact />}
                          </>
                        )}
                      </MenuItem>
                    ))
                  ) : (
                    <Box>
                      <Typography
                        variant="main14"
                        color="text.primary"
                        sx={{ width: '100%', textAlign: 'center', mt: 4, mb: 4 }}
                      >
                        <Trans>No results found.</Trans>
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Select>
            </FormControl>
          )}
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

          {asset.balance && onChange && (
            <>
              <Typography component="div" variant="secondary12" color="text.secondary">
                {balanceText && balanceText !== '' ? balanceText : <Trans>Balance</Trans>}{' '}
                <FormattedNumber
                  value={asset.balance}
                  compact
                  variant="secondary12"
                  color="text.secondary"
                  symbolsColor="text.disabled"
                />
              </Typography>
              {!disableInput && (
                <Button
                  size="small"
                  sx={{ minWidth: 0, ml: '7px', p: 0 }}
                  onClick={() => {
                    if (event) {
                      trackEvent(event.eventName, { ...event.eventParams });
                    }

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
    </Box>
  );
};
