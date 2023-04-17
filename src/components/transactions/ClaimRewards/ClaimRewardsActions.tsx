import { Trans } from '@lingui/macro';
import dayjs from 'dayjs';
import { Reward } from 'src/helpers/types';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useCMReserveIncentiveData } from 'src/hooks/incentive/useReserveIncentiveData';
import { useCMPoolReserves } from 'src/hooks/pool/usePoolReserves';
import { formatReserves } from 'src/store/poolSelectors';
import { useRootStore } from 'src/store/root';

import { TxActionsWrapper } from '../TxActionsWrapper';

export type ClaimRewardsActionsProps = {
  isWrongNetwork: boolean;
  blocked: boolean;
  selectedReward: Reward;
  reserves: ComputedReserveData[];
};

export const ClaimRewardsActions = ({
  isWrongNetwork,
  blocked,
  selectedReward,
}: ClaimRewardsActionsProps) => {
  const claimRewards = useRootStore((state) => state.claimRewards);
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);

  const { data: poolReserves } = useCMPoolReserves();
  const { data: reservesIncentives } = useCMReserveIncentiveData();

  const reserves = poolReserves?.reservesData || [];
  const baseCurrencyData = poolReserves?.baseCurrencyData || {
    marketReferenceCurrencyDecimals: 0,
    marketReferenceCurrencyPriceInUsd: '0',
    networkBaseTokenPriceInUsd: '0',
    networkBaseTokenPriceDecimals: 0,
  };

  const timestamp = dayjs().unix();

  const formattedPoolReserves = formatReserves(
    reserves,
    baseCurrencyData,
    currentNetworkConfig,
    timestamp,
    reservesIncentives ?? []
  );

  const { action, loadingTxns, mainTxState, requiresApproval } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      return claimRewards({
        isWrongNetwork,
        blocked,
        selectedReward,
        reserves: formattedPoolReserves,
      });
    },
    skip: Object.keys(selectedReward).length === 0 || blocked,
    deps: [selectedReward],
  });

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      mainTxState={mainTxState}
      handleAction={action}
      actionText={
        selectedReward.symbol === 'all' ? (
          <Trans>Claim all</Trans>
        ) : (
          <Trans>Claim {selectedReward.symbol}</Trans>
        )
      }
      actionInProgressText={<Trans>Claiming</Trans>}
      isWrongNetwork={isWrongNetwork}
    />
  );
};
