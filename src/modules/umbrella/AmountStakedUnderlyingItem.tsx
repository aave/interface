//yarn import { normalize, USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { keyframes, Stack, Typography } from '@mui/material';
import { formatUnits } from 'ethers/lib/utils';
import { ReactElement } from 'react';
import { ContentWithTooltip } from 'src/components/ContentWithTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { SecondsToString } from 'src/components/SecondsToString';
import { timeMessage } from 'src/helpers/timeHelper';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';
import { useRootStore } from 'src/store/root';

import { ListValueColumn } from '../dashboard/lists/ListValueColumn';
import { MultiIcon } from './helpers/MultiIcon';
import { usePreviewRedeem } from './hooks/usePreviewRedeem';

export const AmountStakedUnderlyingItem = ({
  stakeData,
  isMobile,
}: {
  stakeData: MergedStakeData;
  isMobile?: boolean;
}) => {
  const now = useCurrentTimestamp(1);
  const currentMarketData = useRootStore((s) => s.currentMarketData);
  const chainId = currentMarketData?.chainId;

  const {
    stakeTokenRedeemableAmount,
    underlyingTokenBalance,
    stataTokenAssetBalance: underlyingWaTokenBalance,
  } = stakeData.balances;
  const { underlyingTokenAddress, underlyingTokenDecimals, underlyingIsStataToken, decimals } =
    stakeData;

  const icons = [];
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

  const endOfCooldown = stakeData?.cooldownData.endOfCooldown || 0;
  const unstakeWindow = stakeData?.cooldownData.withdrawalWindow || 0;
  const cooldownAmount = formatUnits(
    stakeData?.cooldownData.cooldownAmount || '0',
    stakeData.decimals
  );
  const cooldownTimeRemaining = endOfCooldown - now;
  const isCooldownActive = cooldownTimeRemaining > 0;
  const isUnstakeWindowActive = endOfCooldown < now && now < endOfCooldown + unstakeWindow;
  const unstakeTimeRemaining = endOfCooldown + unstakeWindow - now;

  // calculate price in USD
  // const priceUsd = normalize(stakeData.price, USD_DECIMALS);
  // const redeemableUsd = valueToBigNumber(assetUnderlyingAmount).multipliedBy(priceUsd).toString();

  return (
    <Stack
      direction={isMobile ? 'row' : 'column'}
      alignItems="center"
      justifyContent="center"
      gap={2}
    >
      {!isCooldownActive && !isUnstakeWindowActive ? (
        <>
          <FormattedNumber compact value={assetUnderlyingAmount} variant="secondary14" />

          {stakeData.underlyingIsStataToken ? (
            <MultiIcon icons={icons} />
          ) : (
            <TokenIcon symbol={stakeData.symbol} sx={{ fontSize: '24px' }} />
          )}
        </>
      ) : (
        <ListValueColumn
          value={assetUnderlyingAmount}
          // subValue={redeemableUsd}
          withTooltip
          disabled={assetUnderlyingAmount === '0'}
        />
      )}
      {isCooldownActive && (
        <Countdown
          timeRemaining={cooldownTimeRemaining}
          tooltipContent={
            <CooldownTooltip cooldownAmount={cooldownAmount} unstakeWindow={unstakeWindow} />
          }
        />
      )}
      {isUnstakeWindowActive && (
        <Countdown
          animate
          timeRemaining={unstakeTimeRemaining}
          tooltipContent={<UnstakeTooltip cooldownAmount={cooldownAmount} />}
        />
      )}
    </Stack>
  );
};

const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
  100% {
    opacity: 1;
  }
`;

const Countdown = ({
  timeRemaining,
  tooltipContent,
  animate,
}: {
  timeRemaining: number;
  tooltipContent: ReactElement;
  animate?: boolean;
}) => {
  return (
    <ContentWithTooltip tooltipContent={tooltipContent}>
      <Stack
        gap={1}
        direction="row"
        alignItems="center"
        sx={{ animation: animate ? `${pulse} 1.5s infinite` : 'none' }}
      >
        <AccessTimeIcon fontSize="small" />
        <Typography variant="helperText">
          <SecondsToString seconds={timeRemaining} />
        </Typography>
      </Stack>
    </ContentWithTooltip>
  );
};

const CooldownTooltip = ({
  cooldownAmount,
  unstakeWindow,
}: {
  cooldownAmount: string;
  unstakeWindow: number;
}) => {
  return (
    <Stack gap={2} direction="column">
      <Trans>
        After the cooldown period ends, you will enter the unstake window of{' '}
        {timeMessage(unstakeWindow)}. You will continue receiving rewards during cooldown and the
        unstake period.
      </Trans>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Trans>Amount in cooldown</Trans>
        <FormattedNumber variant="caption" value={cooldownAmount} />
      </Stack>
    </Stack>
  );
};

const UnstakeTooltip = ({ cooldownAmount }: { cooldownAmount: string }) => {
  return (
    <Stack gap={2} direction="column">
      <Trans>Time remaining until the withdraw period ends.</Trans>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Trans>Available to withdraw</Trans>
        <FormattedNumber variant="caption" value={cooldownAmount} />
      </Stack>
    </Stack>
  );
};
