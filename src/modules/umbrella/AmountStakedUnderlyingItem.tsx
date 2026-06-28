import { Stack } from '@mui/material';
import { formatUnits } from 'ethers/lib/utils';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { useRootStore } from 'src/store/root';

import { usePreviewRedeem } from './hooks/usePreviewRedeem';

export const AmountStakedUnderlyingItem = ({
  stakeData,
  isMobile,
}: {
  stakeData: MergedStakeData;
  isMobile?: boolean;
}) => {
  const currentMarketData = useRootStore((s) => s.currentMarketData);
  const chainId = currentMarketData?.chainId;

  const { stakeTokenRedeemableAmount } = stakeData.balances;
  const { underlyingTokenAddress, underlyingTokenDecimals, underlyingIsStataToken, decimals } =
    stakeData;

  const isGhoToken = !underlyingIsStataToken;

  const { data: sharesEquivalentAssets = '0' } = usePreviewRedeem(
    stakeTokenRedeemableAmount,
    underlyingTokenDecimals,
    underlyingTokenAddress,
    chainId,
    !isGhoToken
  );
  const formattedGhoAmount = formatUnits(stakeTokenRedeemableAmount, decimals);
  const assetUnderlyingAmount = isGhoToken ? formattedGhoAmount : sharesEquivalentAssets;

  return (
    <Stack
      direction={isMobile ? 'row' : 'column'}
      alignItems="center"
      justifyContent="center"
      gap={2}
    >
      <FormattedNumber compact value={assetUnderlyingAmount} variant="secondary14" />
    </Stack>
  );
};
