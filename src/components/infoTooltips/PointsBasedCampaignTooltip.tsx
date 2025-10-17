import { Box, Typography, useTheme } from '@mui/material';

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
      </Box>
    </TextWithTooltip>
  );
};
