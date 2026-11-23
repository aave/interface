import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import {
  Box,
  BoxProps,
  FormControl,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  SvgIconProps,
  Typography,
  useTheme,
} from '@mui/material';
import { ReactNode } from 'react';
import { TrackEventProps } from 'src/store/analyticsSlice';
import { useRootStore } from 'src/store/root';
import { figSurfaceShadow, figVars } from 'src/utils/figmaColors';

import { CapType } from '../caps/helper';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { AvailableTooltip } from '../infoTooltips/AvailableTooltip';
import { FormattedNumber } from '../primitives/FormattedNumber';
import { TokenIcon } from '../primitives/TokenIcon';
import { AmountBalanceRow } from './AmountBalanceRow';
import { AmountInputRow } from './AmountInputRow';

export interface Asset {
  balance?: string;
  symbol: string;
  iconSymbol?: string;
  address?: string;
  aToken?: boolean;
  priceInUsd?: string;
  decimals?: number;
}

export interface AssetInputProps<T extends Asset = Asset> {
  value: string;
  usdValue: string;
  symbol: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  disableInput?: boolean;
  onSelect?: (asset: T) => void;
  assets: T[];
  capType?: CapType;
  maxValue?: string;
  isMaxSelected?: boolean;
  inputTitle?: ReactNode;
  balanceText?: ReactNode;
  loading?: boolean;
  event?: TrackEventProps;
  selectOptionHeader?: ReactNode;
  selectOption?: (asset: T) => ReactNode;
  sx?: BoxProps;
  exchangeRateComponent?: ReactNode;
}

export const amountBoxSx = {
  borderRadius: '0.625rem',
  boxShadow: figSurfaceShadow('shadow-stroke-1'),
  overflow: 'hidden',
  backgroundColor: 'table-bg',
};

export const tokenSx = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  minWidth: 0,
};

export const TokenSelectChevron = ({ sx, ...rest }: SvgIconProps) => (
  <ChevronDownIcon
    {...rest}
    sx={[{ fontSize: '1rem', color: 'fg-chevron' }, ...(Array.isArray(sx) ? sx : [sx])]}
  />
);

export const AssetInput = <T extends Asset = Asset>({
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
  exchangeRateComponent,
}: AssetInputProps<T>) => {
  const theme = useTheme();
  const trackEvent = useRootStore((store) => store.trackEvent);
  const handleSelect = (event: SelectChangeEvent) => {
    const newAsset = assets.find((asset) => asset.symbol === event.target.value) as T;
    onSelect && onSelect(newAsset);
    onChange && onChange('');
  };

  const asset =
    assets.length === 1
      ? assets[0]
      : assets && (assets.find((asset) => asset.symbol === symbol) as T);
  const singleAsset = !onSelect || assets.length === 1;
  const balanceLabel = balanceText || <Trans>Balance</Trans>;
  const handleMax = () => {
    if (event) {
      trackEvent(event.eventName, { ...event.eventParams });
    }
    onChange?.('-1');
  };

  return (
    <Box {...sx}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: '0.625rem' }}>
        <Typography color="fg-3">{inputTitle ? inputTitle : <Trans>Amount</Trans>}</Typography>
        {capType && <AvailableTooltip capType={capType} />}
      </Box>

      <Box sx={amountBoxSx}>
        <Box sx={{ p: '1.25rem' }}>
          <AmountInputRow
            value={value}
            loading={loading}
            disabled={disabled}
            disableInput={disableInput}
            maxValue={maxValue}
            onChange={onChange}
          >
            {singleAsset ? (
              <Box sx={{ ...tokenSx, flexShrink: 0 }}>
                <TokenIcon
                  aToken={asset.aToken}
                  symbol={asset.iconSymbol || asset.symbol}
                  sx={{ fontSize: '1.25rem' }}
                />
                <Typography
                  variant="buttonM"
                  noWrap
                  data-cy="inputAsset"
                  title={symbol}
                  sx={{ maxWidth: '9ch' }}
                >
                  {symbol}
                </Typography>
              </Box>
            ) : (
              <FormControl>
                <Select
                  disabled={disabled}
                  value={asset.symbol}
                  onChange={handleSelect}
                  variant="outlined"
                  className="AssetInput__select"
                  IconComponent={TokenSelectChevron}
                  data-cy={'assetSelect'}
                  MenuProps={{
                    MenuListProps: { style: { width: '100%' } },
                    sx: {
                      maxHeight: '240px',
                      '.MuiPaper-root': {
                        border: theme.palette.mode === 'dark' ? '1px solid #EBEBED1F' : 'unset',
                        boxShadow: '0px 2px 10px 0px #0000001A',
                      },
                    },
                  }}
                  sx={{
                    height: '2.25rem',
                    '&.AssetInput__select': {
                      '& .MuiOutlinedInput-input': {
                        display: 'flex',
                        alignItems: 'center',
                        minHeight: 0,
                        py: 0,
                        pl: '0.625rem',
                        pr: '2.125rem !important',
                        backgroundColor: 'transparent',
                      },
                      '& .MuiOutlinedInput-notchedOutline': { display: 'none' },
                      '& .MuiSelect-icon': { right: '0.625rem' },
                    },
                  }}
                  renderValue={(symbol) => {
                    const asset =
                      assets.length === 1
                        ? assets[0]
                        : assets && (assets.find((asset) => asset.symbol === symbol) as T);
                    return (
                      <Box
                        sx={tokenSx}
                        data-cy={`assetsSelectedOption_${asset.symbol.toUpperCase()}`}
                      >
                        <TokenIcon
                          symbol={asset.iconSymbol || asset.symbol}
                          aToken={asset.aToken}
                          sx={{ fontSize: '1.25rem' }}
                        />
                        <Typography variant="buttonM" color="fg-1" noWrap sx={{ maxWidth: '9ch' }}>
                          {symbol}
                        </Typography>
                      </Box>
                    );
                  }}
                >
                  {selectOptionHeader ? selectOptionHeader : undefined}
                  {assets.map((asset) => (
                    <MenuItem
                      key={asset.symbol}
                      value={asset.symbol}
                      data-cy={`assetsSelectOption_${asset.symbol.toUpperCase()}`}
                    >
                      {selectOption ? (
                        selectOption(asset)
                      ) : (
                        <>
                          <TokenIcon
                            aToken={asset.aToken}
                            symbol={asset.iconSymbol || asset.symbol}
                            sx={{ fontSize: '22px', mr: 1 }}
                          />
                          <ListItemText sx={{ mr: 6 }}>{asset.symbol}</ListItemText>
                          {asset.balance && <FormattedNumber value={asset.balance} compact />}
                        </>
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </AmountInputRow>

          <AmountBalanceRow
            usdValue={usdValue}
            loading={loading}
            balance={onChange ? asset.balance : undefined}
            balanceLabel={balanceLabel}
            showControls={!disableInput}
            disabled={disabled}
            maxDisabled={isMaxSelected}
            onPercent={(fraction) =>
              onChange?.(
                valueToBigNumber(asset.balance || '0')
                  .multipliedBy(fraction)
                  .toFixed()
              )
            }
            onMax={handleMax}
          />
        </Box>
        {exchangeRateComponent && (
          <Box
            sx={{
              background: figVars['bg-2'],
              borderTop: `1px solid ${figVars['border-2']}`,
              px: '1.25rem',
              py: 2,
            }}
          >
            {exchangeRateComponent}
          </Box>
        )}
      </Box>
    </Box>
  );
};
