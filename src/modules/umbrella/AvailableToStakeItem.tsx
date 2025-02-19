import { Trans } from '@lingui/macro';
import { Box, Stack, Typography } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { useRootStore } from 'src/store/root';

import { AmountAvailableItem } from './helpers/AmountAvailableItem';
import { MultiIconWithTooltip } from './helpers/MultiIcon';

export const AvailableToStakeItem = ({
  stakeData,
  isMobile,
}: {
  stakeData: MergedStakeData;
  isMobile?: boolean;
}) => {
  const {
    stataTokenAssetBalance: underlyingWaTokenBalance,
    aTokenBalanceAvailableToStake,
    underlyingTokenBalance,
  } = stakeData.formattedBalances;

  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);

  const icons = [];
  if (stakeData.stataTokenData.isUnderlyingWrappedBaseToken) {
    icons.push({
      src: currentNetworkConfig.baseAssetSymbol,
      aToken: false,
    });
  }
  if (underlyingTokenBalance) {
    icons.push({
      src: stakeData.stataTokenData.assetSymbol,
      aToken: false,
    });
  }
  if (underlyingWaTokenBalance) {
    icons.push({
      src: stakeData.stataTokenData.assetSymbol,
      aToken: true,
    });
  }
  if (underlyingTokenBalance && Number(underlyingTokenBalance) > 0) {
    icons.push({
      src: stakeData.stataTokenData.assetSymbol,
      aToken: false,
      waToken: true,
    });
  }

  let totalAvailableToStake =
    Number(underlyingTokenBalance) +
    Number(underlyingWaTokenBalance) +
    Number(aTokenBalanceAvailableToStake);

  if (stakeData.stataTokenData.isUnderlyingWrappedBaseToken) {
    totalAvailableToStake += Number(stakeData.formattedBalances.nativeTokenBalance);
  }

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
      {stakeData.underlyingIsStataToken ? (
        <MultiIconWithTooltip
          icons={icons}
          tooltipContent={<AvailableToStakeTooltipContent stakeData={stakeData} />}
        />
      ) : (
        <TokenIcon symbol={stakeData.symbol} sx={{ fontSize: '20px' }} />
      )}
    </Stack>
  );
};

export const AvailableToStakeTooltipContent = ({ stakeData }: { stakeData: MergedStakeData }) => {
  const {
    aTokenBalanceAvailableToStake,
    stataTokenAssetBalance: underlyingWaTokenBalance,
    underlyingTokenBalance,
  } = stakeData.formattedBalances;

  const { assetSymbol } = stakeData.stataTokenData;
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);

  return (
    <Stack direction="column" alignItems="center" justifyContent="center" minWidth={160}>
      <Typography variant="caption" color="text.secondary" mb={3}>
        <Trans>Your balance of assets that are available to stake</Trans>
      </Typography>
      <Box sx={{ width: '100%' }}>
        {stakeData.stataTokenData.isUnderlyingWrappedBaseToken && (
          <AmountAvailableItem
            symbol={currentNetworkConfig.baseAssetSymbol}
            name={currentNetworkConfig.baseAssetSymbol}
            value={stakeData.formattedBalances.nativeTokenBalance}
          />
        )}
        {underlyingWaTokenBalance && (
          <AmountAvailableItem
            symbol={assetSymbol}
            name={assetSymbol}
            value={underlyingWaTokenBalance}
          />
        )}
        {aTokenBalanceAvailableToStake && (
          <AmountAvailableItem
            symbol={assetSymbol}
            name={`a${assetSymbol}`}
            value={aTokenBalanceAvailableToStake}
            aToken
          />
        )}
        {underlyingTokenBalance && Number(underlyingTokenBalance) > 0 && (
          <AmountAvailableItem
            symbol={assetSymbol}
            name={stakeData.underlyingTokenSymbol}
            value={underlyingTokenBalance}
            waToken
          />
        )}
      </Box>
    </Stack>
  );
};
