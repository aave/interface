import { Box, Input, InputAdornment, Typography, useTheme } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import { convertAprToApy } from 'src/utils/utils';

import { FormattedNumber } from '../primitives/FormattedNumber';
import { TokenIcon } from '../primitives/TokenIcon';
import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

interface PointBasedCampaignTooltipProps extends TextWithTooltipProps {
  aToken: boolean;
  tokenIconSymbol: string;
  symbol: string;
  isBorrow: boolean;
  pointsPerThousandUsd: number;
}

export const PointsBasedCampaignTooltip = ({
  aToken,
  tokenIconSymbol,
  symbol,
  isBorrow,
  pointsPerThousandUsd,
  ...rest
}: PointBasedCampaignTooltipProps) => {
  const theme = useTheme();
  const typographyVariant = 'secondary12';
  const [inkPriceInput, setInkPriceInput] = useState('');
  const [estimatedPointsValue, setEstimatedPointsValue] = useState<number | null>(null);
  const [estimatedAPY, setEstimatedAPY] = useState<number | null>(null);
  const [estimatedFDV, setEstimatedFDV] = useState<number | null>(null);
  const TOTAL_INK_SUPPLY = 1_000_000_000;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const trimmedValue = inkPriceInput.trim();

      if (!trimmedValue) {
        setEstimatedPointsValue(null);
        setEstimatedAPY(null);
        setEstimatedFDV(null);
        return;
      }

      const normalizedValue = trimmedValue.replace(/,/g, '');
      const numericPrice = Number(normalizedValue);

      if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        setEstimatedPointsValue(null);
        setEstimatedAPY(null);
        setEstimatedFDV(null);
        return;
      }
      const dailyUsdValue = pointsPerThousandUsd * numericPrice;
      setEstimatedPointsValue(dailyUsdValue);
      setEstimatedFDV(numericPrice * TOTAL_INK_SUPPLY);

      const aprDecimal = (dailyUsdValue / 1000) * 365;
      const apyDecimal = convertAprToApy(aprDecimal);

      setEstimatedAPY(apyDecimal * 100);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [inkPriceInput, pointsPerThousandUsd]);

  const hasInkPriceInput = inkPriceInput.trim().length > 0;

  const handleInkPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInkPriceInput(event.target.value);
  };

  return (
    <TextWithTooltip {...rest}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          py: 2,
          px: 0,
          maxWidth: '200px',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            pb: 1,
            borderBottom: 1,
            borderColor: theme.palette.divider,
          }}
        >
          <TokenIcon aToken={aToken} symbol={tokenIconSymbol} sx={{ fontSize: '18px' }} />
          <Typography variant="h4" sx={{ fontWeight: 500 }}>
            {symbol}
          </Typography>
        </Box>

        {/* Description */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            pb: 1,
          }}
        >
          <Typography
            variant="caption"
            color={theme.palette.text.secondary}
            sx={{ lineHeight: 1.5 }}
          >
            The estimated amount of TydroInkPoints that you get per $1,000 net{' '}
            {isBorrow ? 'borrowed' : 'supplied'} per day.
          </Typography>
        </Box>

        {/* Points rate display */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1.5,
            backgroundColor: theme.palette.action.hover,
            borderRadius: 1,
          }}
        >
          <Typography variant={typographyVariant} color={theme.palette.text.secondary}>
            Points per $1,000/day
          </Typography>
          <Typography variant={typographyVariant} sx={{ fontWeight: 600 }}>
            <FormattedNumber
              value={pointsPerThousandUsd || 0}
              visibleDecimals={2}
              variant={typographyVariant}
            />
          </Typography>
        </Box>

        {/* Estimated calculation */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.25,
            p: 1.5,
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Typography variant={typographyVariant} color={theme.palette.text.secondary}>
            Estimate APY and points value
          </Typography>

          <Input
            name="inkPrice"
            type="string"
            value={inkPriceInput}
            onChange={handleInkPriceChange}
            placeholder="Introduce an INK price in USD"
            disableUnderline
            endAdornment={
              hasInkPriceInput ? (
                <InputAdornment
                  position="end"
                  sx={{
                    color: theme.palette.text.secondary,
                    pointerEvents: 'none',
                    pr: 1,
                  }}
                >
                  USD&nbsp;per&nbsp;INK
                </InputAdornment>
              ) : null
            }
            sx={{
              alignContent: 'center',
              borderRadius: 1,
              pl: 1,
              height: 24,
              border: `1px solid ${theme.palette.divider}`,
              transition: theme.transitions.create(['border-color', 'box-shadow']),
              backgroundColor: theme.palette.background.default,
              '&:focus-within': { borderColor: theme.palette.primary.main },
            }}
          />

          {estimatedPointsValue !== null && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 1,
                  py: 1,
                  borderRadius: 1,
                  backgroundColor: theme.palette.action.hover,
                }}
              >
                <Typography variant={typographyVariant} color={theme.palette.text.secondary}>
                  USD value
                </Typography>
                <Typography variant={typographyVariant} sx={{ fontWeight: 500 }}>
                  $
                  <FormattedNumber
                    value={estimatedPointsValue}
                    visibleDecimals={2}
                    variant={typographyVariant}
                  />
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 1,
                  py: 1,
                  borderRadius: 1,
                  backgroundColor: theme.palette.action.hover,
                }}
              >
                <Typography variant={typographyVariant} color={theme.palette.text.secondary}>
                  APY
                </Typography>
                <Typography variant={typographyVariant} sx={{ fontWeight: 600 }}>
                  <FormattedNumber
                    value={estimatedAPY || 0}
                    visibleDecimals={2}
                    variant={typographyVariant}
                  />
                  %
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 1,
                  py: 1,
                  borderRadius: 1,
                  backgroundColor: theme.palette.action.hover,
                }}
              >
                <Typography variant={typographyVariant} color={theme.palette.text.secondary}>
                  FDV
                </Typography>
                <Typography variant={typographyVariant} sx={{ fontWeight: 500 }}>
                  $
                  <FormattedNumber
                    value={estimatedFDV || 0}
                    visibleDecimals={2}
                    variant={typographyVariant}
                  />
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </TextWithTooltip>
  );
};
