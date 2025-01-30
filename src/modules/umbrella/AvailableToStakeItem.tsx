import { Trans } from '@lingui/macro';
import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';

import { AmountAvailableItem } from './helpers/AmountAvailableItem';
import { MultiIconWithTooltip } from './helpers/MultiIcon';

export const AvailableToStakeItem = ({ stakeData }: { stakeData: MergedStakeData }) => {
  const { underlyingWaTokenBalance, underlyingWaTokenATokenBalance, underlyingTokenBalance } =
    stakeData.formattedBalances;

  const { breakpoints } = useTheme();

  const isMobile = useMediaQuery(breakpoints.down('lg'));

  const icons = [];
  if (underlyingTokenBalance) {
    icons.push({
      src: stakeData.waTokenData.waTokenUnderlyingSymbol,
      aToken: false,
    });
  }
  if (underlyingWaTokenBalance) {
    icons.push({
      src: stakeData.waTokenData.waTokenUnderlyingSymbol,
      aToken: true,
    });
  }
  if (underlyingTokenBalance && Number(underlyingTokenBalance) > 0) {
    icons.push({
      src: stakeData.waTokenData.waTokenUnderlyingSymbol,
      aToken: false,
      waToken: true,
    });
  }

  const totalAvailableToStake =
    Number(underlyingTokenBalance) +
    Number(underlyingWaTokenBalance) +
    Number(underlyingWaTokenATokenBalance);

  return (
    <Stack
      direction={isMobile ? 'row' : 'column'}
      alignItems="center"
      justifyContent="center"
      gap={2}
    >
      <FormattedNumber
        compact
        value={totalAvailableToStake}
        variant="main16"
        color={totalAvailableToStake === 0 ? 'text.disabled' : 'text.main'}
      />
      {stakeData.underlyingIsWaToken ? (
        <MultiIconWithTooltip
          icons={icons}
          tooltipContent={<AvailableToStakeTooltipContent stakeData={stakeData} />}
        />
      ) : (
        <TokenIcon symbol={stakeData.stakeTokenSymbol} sx={{ fontSize: '20px' }} />
      )}
    </Stack>
  );
};

export const AvailableToStakeTooltipContent = ({ stakeData }: { stakeData: MergedStakeData }) => {
  const { underlyingWaTokenATokenBalance, underlyingWaTokenBalance, underlyingTokenBalance } =
    stakeData.formattedBalances;

  const { waTokenUnderlyingSymbol } = stakeData.waTokenData;

  return (
    <Stack direction="column" alignItems="center" justifyContent="center" minWidth={160}>
      <Typography variant="caption" color="text.secondary" mb={3}>
        <Trans>Your balance of assets that are available to stake</Trans>
      </Typography>
      <Box sx={{ width: '100%' }}>
        {underlyingWaTokenBalance && (
          <AmountAvailableItem
            symbol={waTokenUnderlyingSymbol}
            name={waTokenUnderlyingSymbol}
            value={underlyingWaTokenBalance}
          />
        )}
        {underlyingWaTokenATokenBalance && (
          <AmountAvailableItem
            symbol={waTokenUnderlyingSymbol}
            name={`a${waTokenUnderlyingSymbol}`}
            value={underlyingWaTokenATokenBalance}
            aToken
          />
        )}
        {underlyingTokenBalance && Number(underlyingTokenBalance) > 0 && (
          <AmountAvailableItem
            symbol={waTokenUnderlyingSymbol}
            name={stakeData.underlyingTokenSymbol}
            value={underlyingTokenBalance}
            waToken
          />
        )}
      </Box>
    </Stack>
  );
};
