import { valueToBigNumber } from '@aave/math-utils';
import { isAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';
import { ExclamationIcon } from '@heroicons/react/outline';
import { XCircleIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LaunchIcon from '@mui/icons-material/Launch';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputBase,
  MenuItem,
  Popover,
  SvgIcon,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import NumberFormat, { NumberFormatProps } from 'react-number-format';
import { MarketLogo } from 'src/components/MarketSwitcher';
import { Link } from 'src/components/primitives/Link';
import { textCenterEllipsis } from 'src/helpers/text-center-ellipsis';
import { useRootStore } from 'src/store/root';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';
import { figSurfaceShadow, figVars } from 'src/utils/figmaColors';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { COMMON_SWAPS } from '../../../../../ui-config/TokenList';
import { BasicModal } from '../../../../primitives/BasicModal';
import { FormattedNumber } from '../../../../primitives/FormattedNumber';
import { ExternalTokenIcon } from '../../../../primitives/TokenIcon';
import { SearchInput } from '../../../../SearchInput';
import { TxModalTitle } from '../../../FlowCommons/TxModalTitle';
import { SwappableToken, SwapType, TokenType } from '../../types';

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
  onClear?: () => void;
  enableHover?: boolean;
  disabled?: boolean;
  disableInput?: boolean;
  onSelect?: (asset: SwappableToken) => void;
  assets: SwappableToken[];
  maxValue?: string;
  forcedMaxValue?: string;
  loading?: boolean;
  selectedAsset: SwappableToken;
  balanceTitle?: string;
  showBalance?: boolean;
  allowCustomTokens?: boolean;
  title?: string;
  swapType: SwapType;
  side: 'input' | 'output';
}

export const SwitchAssetInput = ({
  value,
  usdValue,
  onChange,
  onClear,
  enableHover = false,
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
  title,
  swapType,
  side,
}: AssetInputProps) => {
  const theme = useTheme();
  const networkConfig = getNetworkConfig(chainId);
  const networkName = networkConfig.displayName || networkConfig.name;
  const getApyInfo = (asset: SwappableToken, swapType: SwapType, side: 'input' | 'output') => {
    switch (swapType) {
      case SwapType.RepayWithCollateral:
        return side === 'input'
          ? asset.variableBorrowAPY
            ? { label: 'Borrow APY', value: Number(asset.variableBorrowAPY) }
            : undefined
          : asset.supplyAPY
          ? { label: 'Supply APY', value: Number(asset.supplyAPY) }
          : undefined;
      case SwapType.WithdrawAndSwap:
        return side === 'input' && asset.supplyAPY
          ? { label: 'Supply APY', value: Number(asset.supplyAPY) }
          : undefined;
      case SwapType.CollateralSwap:
        return asset.supplyAPY
          ? { label: 'Supply APY', value: Number(asset.supplyAPY) }
          : undefined;
      case SwapType.DebtSwap:
        return asset.variableBorrowAPY
          ? { label: 'Borrow APY', value: Number(asset.variableBorrowAPY) }
          : undefined;
      case SwapType.Swap:
      default:
        return undefined;
    }
  };
  const handleSelect = (asset: SwappableToken) => {
    onSelect && onSelect(asset);
    onChange && onChange('');
    handleClose();
  };

  const { erc20Service } = useSharedDependencies();

  const [openModal, setOpenModal] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const [pickerHeight, setPickerHeight] = useState<number | undefined>(undefined);

  const handleClick = () => {
    if (assets.length === 1) return;
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    handleCleanSearch();
  };

  // Match token picker height to the current swap modal paper height
  useEffect(() => {
    const paper = inputRef.current?.closest('.MuiPaper-root') as HTMLElement | null;
    if (paper) {
      setPickerHeight(paper.clientHeight);
    }
  }, [openModal]);

  const [filteredAssets, setFilteredAssets] = useState(assets);
  const [loadingNewAsset, setLoadingNewAsset] = useState(false);
  const user = useRootStore((store) => store.account);

  useEffect(() => {
    setFilteredAssets(assets);
  }, [assets]);

  const popularAssets = assets.filter((asset) => COMMON_SWAPS.includes(asset.symbol));

  const getRecentStorageKey = (swapType: SwapType, chainId: number, side: 'input' | 'output') =>
    `aave_recent_tokens_${swapType}_${chainId}_${side}`;

  const recentAddresses: string[] = (() => {
    try {
      const raw = localStorage.getItem(getRecentStorageKey(swapType, chainId, side));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();

  const recentAssets = recentAddresses
    .map((addr) => assets.find((a) => a.addressToSwap.toLowerCase() === String(addr).toLowerCase()))
    .filter(Boolean) as SwappableToken[];

  const seen = new Set<string>();
  const mergedPopular = [...recentAssets, ...popularAssets].filter((asset) => {
    const key = asset.addressToSwap.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const popularSectionTitle = recentAssets.length > 0 ? 'Recently used & Popular' : 'Popular';
  const handleSearchAssetChange = (value: string) => {
    const searchQuery = value.trim().toLowerCase();
    const matchingAssets = assets.filter(
      (asset) =>
        asset.symbol.toLowerCase().includes(searchQuery) ||
        asset.name.toLowerCase().includes(searchQuery) ||
        asset.addressToSwap.toLowerCase() === searchQuery
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
              addressToSwap: tokenMetadata.address,
              addressForUsdPrice: tokenMetadata.address,
              underlyingAddress: tokenMetadata.address,
              decimals: tokenMetadata.decimals,
              symbol: tokenMetadata.symbol,
              name: tokenMetadata.name,
              tokenType: TokenType.USER_CUSTOM,
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
      sx={{
        width: '100%',
      }}
    >
      {title && (
        <Typography variant="h5" color="fg-2" sx={{ mb: 1 }}>
          {title}
        </Typography>
      )}
      <Box
        ref={inputRef}
        sx={{
          borderRadius: '0.75rem',
          boxShadow: figSurfaceShadow('shadow-stroke-1'),
          overflow: 'hidden',
          backgroundColor: 'bg-2',
          px: 3,
          py: 2,
          width: '100%',
          ...(enableHover
            ? {
                transition: 'background-color 0.15s ease',
                '&:hover': {
                  backgroundColor: 'bg-2',
                },
              }
            : {}),
        }}
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
                color: 'fg-3',
                '&:hover': {
                  color: 'fg-2',
                },
              }}
              onClick={() => {
                if (onClear) {
                  onClear();
                } else {
                  onChange && onChange('');
                }
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
              variant="h4"
              color="fg-1"
              sx={{ fontWeight: 500 }}
            >
              {selectedAsset.symbol}
            </Typography>
            {selectedAsset.tokenType === TokenType.USER_CUSTOM && (
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
            minContentHeight={600}
            contentHeight={Math.max(
              pickerHeight ?? 0,
              mergedPopular.length && filteredAssets.length > 3 ? 600 : 0
            )}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: '1rem',
                }}
              >
                <TxModalTitle title={<Trans>Select token</Trans>} sx={{ mb: 0 }} />
                <MarketLogo size={16} logo={networkConfig.networkLogoPath} sx={{ mr: 0 }} />
                <Typography variant="secondary16" color="fg-2" sx={{ lineHeight: 1, mt: '1px' }}>
                  {networkName}
                </Typography>
              </Box>

              <Box
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                  mb: '1rem',
                  boxShadow: '0px 4px 6px -6px rgba(0, 0, 0, 0.1)',
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
                      mt: '1rem',
                      gap: 1.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="fg-2"
                      sx={{ display: 'block', width: '100%' }}
                    >
                      <Trans>{popularSectionTitle}</Trans>
                    </Typography>
                    {mergedPopular.map((asset) => (
                      <Box
                        key={asset.addressToSwap}
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          p: 1,
                          borderRadius: '16px',
                          border: '1px solid',
                          borderColor: 'border-2',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'border-2',
                          },
                        }}
                        onClick={() => handleSelect(asset)}
                      >
                        <ExternalTokenIcon
                          logoURI={asset.logoURI}
                          symbol={asset.symbol}
                          sx={{ fontSize: '24px', mr: 1 }}
                        />
                        <Typography variant="subheader1" color="fg-1" sx={{ mr: 1 }}>
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
                  maxHeight: 'calc(800px - 180px)',
                  mx: -6,
                  pl: 3,
                  pr: '1rem',
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: figVars['border-2'],
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: figVars['button-hover'],
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
                      key={asset.addressToSwap}
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
                        height="24px"
                        width="24px"
                        sx={{ mr: 2 }}
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', mr: 2, minWidth: 0 }}>
                        <Typography variant="h4" fontWeight={500} color="fg-1" noWrap>
                          {asset.name || asset.symbol}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Link
                            href={getNetworkConfig(chainId).explorerLinkBuilder({
                              address: asset.underlyingAddress || asset.addressToSwap,
                            })}
                            noLinkStyle
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            sx={{
                              display:
                                asset.tokenType === TokenType.NATIVE ? 'none' : 'inline-flex',
                              alignItems: 'center',
                              textDecoration: 'none',
                              '&:hover .launch-icon-text': {
                                color:
                                  theme.palette.mode === 'dark'
                                    ? theme.vars.palette.primary.light
                                    : theme.vars.palette.primary.main,
                              },
                              '&:hover .launch-icon-svg': {
                                color:
                                  theme.palette.mode === 'dark'
                                    ? theme.vars.palette.primary.light
                                    : theme.vars.palette.primary.main,
                              },
                            }}
                          >
                            <Typography
                              variant="caption"
                              className="launch-icon-text"
                              color="fg-2"
                              noWrap
                            >
                              {textCenterEllipsis(
                                (asset.underlyingAddress || asset.addressToSwap) ?? '',
                                6,
                                4
                              )}
                            </Typography>
                            <SvgIcon
                              className="launch-icon-svg"
                              sx={{ fontSize: 14, ml: 0.5, color: 'fg-2' }}
                            >
                              <LaunchIcon />
                            </SvgIcon>
                          </Link>
                          {(() => {
                            const apy = getApyInfo(asset, swapType, side);
                            if (!apy) return null;
                            return (
                              <>
                                <Typography variant="caption" color="fg-2">
                                  {' • '}
                                </Typography>
                                <Tooltip title={apy.label}>
                                  <span>
                                    <FormattedNumber
                                      value={apy.value}
                                      percent
                                      variant="caption"
                                      color="fg-2"
                                    />
                                  </span>
                                </Tooltip>
                              </>
                            );
                          })()}
                        </Box>
                      </Box>
                      {asset.tokenType === TokenType.USER_CUSTOM && (
                        <SvgIcon sx={{ fontSize: 16, mr: 1 }} color="warning">
                          <ExclamationIcon />
                        </SvgIcon>
                      )}
                      <Box
                        sx={{
                          display: valueToBigNumber(asset.balance || '0').gt(0) ? 'flex' : 'none',
                          flexDirection: 'column',
                          ml: 'auto',
                        }}
                      >
                        {asset.balance && (
                          <FormattedNumber
                            value={asset.balance}
                            compact
                            variant="h5"
                            color="fg-1"
                            sx={{ textAlign: 'right' }}
                          />
                        )}
                        {asset.usdPrice && (
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                              width: '100%',
                            }}
                          >
                            <FormattedNumber
                              value={Number(
                                valueToBigNumber(asset.balance || '0')
                                  .multipliedBy(asset.usdPrice)
                                  .toString()
                              )}
                              compact
                              symbol="USD"
                              variant="helperText"
                              color="fg-2"
                              symbolsColor="fg-2"
                              sx={{ textAlign: 'right' }}
                            />
                          </Box>
                        )}
                      </Box>
                    </MenuItem>
                  ))
                ) : (
                  <Typography
                    variant="subheader1"
                    color="fg-1"
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
              variant="subheader2"
              color="fg-3"
              symbolsColor="fg-3"
              flexGrow={1}
            />
          )}

          {showBalance && selectedAsset.balance && (
            <>
              <Typography component="div" variant="subheader2" color="fg-2">
                <Trans>{balanceTitle || 'Balance'}</Trans>
                <FormattedNumber
                  value={selectedAsset.balance}
                  compact
                  variant="subheader2"
                  color="fg-2"
                  symbolsColor="fg-4"
                  sx={{ ml: 1 }}
                />
              </Typography>
              {!disableInput && (
                <PercentSelector
                  disabled={disabled || Number(selectedAsset.balance) === 0}
                  onSelectPercent={(fraction) => {
                    const maxBase = forcedMaxValue || selectedAsset.balance || '0';
                    const next = valueToBigNumber(maxBase).multipliedBy(fraction).toString();
                    onChange && onChange(next);
                  }}
                />
              )}
              {!disableInput && (
                <Button
                  size="small"
                  sx={{ minWidth: 0, ml: '1px', pt: 0, pb: 0, mr: '-5px' }}
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
    </Box>
  );
};

const PercentSelector = ({
  disabled,
  onSelectPercent,
}: {
  disabled?: boolean;
  onSelectPercent: (fraction: number) => void;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const handlePick = (fraction: number) => {
    onSelectPercent(fraction);
    handleClose();
  };

  return (
    <>
      <Button
        size="small"
        sx={{ minWidth: 0, ml: '6px', py: 0, fontSize: '12px' }}
        onClick={handleOpen}
        disabled={disabled}
      >
        <Trans>%</Trans>
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{
          sx: {
            p: 1,
            backgroundColor: 'bg-2',
            border: '1px solid',
            borderColor: 'border-2',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5 }}>
          <ToggleButtonGroup
            exclusive
            sx={{
              backgroundColor: 'bg-2',
              borderRadius: '6px',
              borderColor: 'bg-2',
            }}
            onChange={(_, v) => v && handlePick(v)}
          >
            {[0.25, 0.5, 0.75].map((fraction) => (
              <ToggleButton
                key={fraction}
                value={fraction}
                sx={{
                  borderRadius: 1,
                  py: 0.5,
                  px: 1,
                  border: 0,
                  '&.Mui-selected': {
                    backgroundColor: 'surface-elevated',
                  },
                }}
              >
                <Typography variant="subheader2" color="primary.main">
                  {Math.round(fraction * 100)}%
                </Typography>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Popover>
    </>
  );
};
