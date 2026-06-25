import { Stake } from '@aave/contract-helpers';
import { bigDecimal, useSghoVaultPreviewDeposit } from '@aave/react';
import { Trans } from '@lingui/macro';
import { formatEther } from 'ethers/lib/utils';
import { useRef } from 'react';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { useModalContext } from 'src/hooks/useModal';
import { useSavingsMarketData } from 'src/hooks/useSavingsMarketData';
import { useSGhoVaultContext } from 'src/modules/sGho/SGhoVaultContext';
import { useRootStore } from 'src/store/root';

import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { TxErrorView } from '../FlowCommons/Error';
import { TxSuccessView } from '../FlowCommons/Success';
import { DetailsNumberLineWithSub, TxModalDetails } from '../FlowCommons/TxModalDetails';
import { StkGhoMigrateActions } from './StkGhoMigrateActions';

export const StkGhoMigrateModalContent = () => {
  const { chainId: connectedChainId } = useWeb3Context();
  const { chainId: targetChainId, sdkChainId } = useSavingsMarketData();
  const { mainTxState, txError, gasLimit } = useModalContext();

  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const { data: stakeUserResult } = useUserStakeUiData(currentMarketData, Stake.gho);

  // stkGHO is redeemable 1:1 to GHO, so the migrated GHO amount equals the
  // user's full stkGHO position. We use it to preview the sGHO shares minted.
  const stkGhoBalance = formatEther(stakeUserResult?.[0]?.stakeTokenRedeemableAmount || '0');

  const previewAmount = +stkGhoBalance > 0 ? stkGhoBalance : '0';
  const { data: previewShares, loading: previewFetching } = useSghoVaultPreviewDeposit({
    amount: bigDecimal(previewAmount),
    chainId: sdkChainId,
  });

  // USD pricing from the sGHO vault. stkGHO is 1:1 to GHO, so it's priced at the
  // GHO rate (`usdPerToken`). sGHO shares appreciate (not 1:1 to GHO), so they're
  // priced at the vault share price = totalAssetsUSD / totalSupply.
  const { vault } = useSGhoVaultContext();
  const ghoUsdPerToken = +(vault?.totalAssets?.usdPerToken ?? '1');
  const totalAssetsUsd = +(vault?.totalAssets?.usd ?? '0');
  const totalSupply = +(vault?.totalSupply?.value ?? '0');
  const sghoUsdPerShare =
    totalSupply > 0 && totalAssetsUsd > 0 ? totalAssetsUsd / totalSupply : ghoUsdPerToken;

  const stkGhoUSD = (+stkGhoBalance * ghoUsdPerToken).toString();
  const sghoUSD = (+(previewShares?.value ?? '0') * sghoUsdPerShare).toString();

  const isWrongNetwork = connectedChainId !== targetChainId;

  // Snapshot the received shares at submit time — once the tx mines the Actions
  // invalidate the stake data, so `stkGhoBalance` (and thus `previewShares`)
  // refetches to 0 and would otherwise blank the success view.
  const receivedSharesRef = useRef<string | null>(null);
  if (mainTxState.txHash && receivedSharesRef.current === null) {
    receivedSharesRef.current = previewShares?.value ?? '0';
  }
  if (!mainTxState.txHash && !mainTxState.success && receivedSharesRef.current !== null) {
    receivedSharesRef.current = null;
  }

  if (txError && txError.blocking) return <TxErrorView txError={txError} />;
  if (mainTxState.success) {
    return (
      <TxSuccessView
        action={<Trans>received</Trans>}
        amount={receivedSharesRef.current ?? previewShares?.value ?? '0'}
        symbol="sGHO"
      />
    );
  }

  return (
    <>
      <TxModalDetails gasLimit={gasLimit} chainId={targetChainId}>
        <DetailsNumberLineWithSub
          description={<Trans>Migrating</Trans>}
          futureValue={stkGhoBalance}
          futureValueUSD={stkGhoUSD}
          symbol="stkGHO"
        />
        <DetailsNumberLineWithSub
          description={<Trans>You&apos;ll receive</Trans>}
          futureValue={previewShares?.value ?? '0'}
          futureValueUSD={sghoUSD}
          symbol="sGHO"
          loading={previewFetching}
        />
      </TxModalDetails>

      <StkGhoMigrateActions
        isWrongNetwork={isWrongNetwork}
        blocked={+stkGhoBalance <= 0}
        sx={{ mt: '48px' }}
      />
    </>
  );
};
