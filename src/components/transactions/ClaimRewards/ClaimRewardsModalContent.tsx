import { ChainId } from '@aave/contract-helpers';
import { normalize, UserIncentiveData } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { Reward } from 'src/helpers/types';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import {
  DetailsNumberLine,
  DetailsNumberLineWithSub,
  TxModalDetails,
} from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { ClaimRewardsActions } from './ClaimRewardsActions';
import { RewardsSelect } from './RewardsSelect';

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

export const ClaimRewardsModalContent = () => {
  const { gasLimit, mainTxState: claimRewardsTxState, txError } = useModalContext();
  const { user, reserves } = useAppDataContext();
  const { currentChainId, currentMarketData } = useProtocolDataContext();
  const { chainId: connectedChainId, readOnlyModeAddress } = useWeb3Context();
  const [claimableUsd, setClaimableUsd] = useState('0');
  const [selectedRewardSymbol, setSelectedRewardSymbol] = useState<string>('all');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [allReward, setAllReward] = useState<Reward>();

  const networkConfig = getNetworkConfig(currentChainId);

  // get all rewards
  useEffect(() => {
    const userIncentives: Reward[] = [];
    let totalClaimableUsd = Number(claimableUsd);
    const allAssets: string[] = [];
    Object.keys(user.calculatedUserIncentives).forEach((rewardTokenAddress) => {
      const incentive: UserIncentiveData = user.calculatedUserIncentives[rewardTokenAddress];
      const rewardBalance = normalize(incentive.claimableRewards, incentive.rewardTokenDecimals);

      let tokenPrice = 0;
      // getting price from reserves for the native rewards for v2 markets
      if (!currentMarketData.v3 && Number(rewardBalance) > 0) {
        if (currentMarketData.chainId === ChainId.mainnet) {
          const aave = reserves.find((reserve) => reserve.symbol === 'AAVE');
          tokenPrice = aave ? Number(aave.priceInUSD) : 0;
        } else {
          reserves.forEach((reserve) => {
            if (reserve.isWrappedBaseAsset) {
              tokenPrice = Number(reserve.priceInUSD);
            }
          });
        }
      } else {
        tokenPrice = Number(incentive.rewardPriceFeed);
      }

      const rewardBalanceUsd = Number(rewardBalance) * tokenPrice;

      if (rewardBalanceUsd > 0) {
        incentive.assets.forEach((asset) => {
          if (allAssets.indexOf(asset) === -1) {
            allAssets.push(asset);
          }
        });

        userIncentives.push({
          assets: incentive.assets,
          incentiveControllerAddress: incentive.incentiveControllerAddress,
          symbol: incentive.rewardTokenSymbol,
          balance: rewardBalance,
          balanceUsd: rewardBalanceUsd.toString(),
          rewardTokenAddress,
        });

        totalClaimableUsd = totalClaimableUsd + Number(rewardBalanceUsd);
      }
    });

    if (userIncentives.length === 1) {
      setSelectedRewardSymbol(userIncentives[0].symbol);
    } else if (userIncentives.length > 1 && !selectedReward) {
      const allRewards = {
        assets: allAssets,
        incentiveControllerAddress: userIncentives[0].incentiveControllerAddress,
        symbol: 'all',
        balance: '0',
        balanceUsd: totalClaimableUsd.toString(),
        rewardTokenAddress: '',
      };
      setSelectedRewardSymbol('all');
      setAllReward(allRewards);
    }

    setRewards(userIncentives);
    setClaimableUsd(totalClaimableUsd.toString());
  }, []);

  // error handling
  let blockingError: ErrorType | undefined = undefined;
  if (claimableUsd === '0') {
    blockingError = ErrorType.NOT_ENOUGH_BALANCE;
  }

  // error handling render
  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_BALANCE:
        return <Trans>Your reward balance is 0</Trans>;
      default:
        return null;
    }
  };

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;
  const selectedReward =
    selectedRewardSymbol === 'all'
      ? allReward
      : rewards.find((r) => r.symbol === selectedRewardSymbol);

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  if (claimRewardsTxState.success)
    return <TxSuccessView action={<Trans>Claimed</Trans>} amount={selectedReward?.balanceUsd} />;

  return (
    <>
      <TxModalTitle title="Claim rewards" />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
      )}

      {blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          {handleBlocked()}
        </Typography>
      )}

      {rewards.length > 1 && (
        <RewardsSelect
          rewards={rewards}
          selectedReward={selectedRewardSymbol}
          setSelectedReward={setSelectedRewardSymbol}
        />
      )}

      {selectedReward && (
        <TxModalDetails gasLimit={gasLimit}>
          {selectedRewardSymbol === 'all' && (
            <>
              <Row
                caption={<Trans>Balance</Trans>}
                captionVariant="description"
                align="flex-start"
                mb={selectedReward.symbol !== 'all' ? 0 : 4}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  {rewards.map((reward) => (
                    <Box
                      key={`claim-${reward.symbol}`}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        mb: 4,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TokenIcon symbol={reward.symbol} sx={{ mr: 1, fontSize: '16px' }} />
                        <FormattedNumber value={Number(reward.balance)} variant="secondary14" />
                        <Typography ml={1} variant="secondary14">
                          {reward.symbol}
                        </Typography>
                      </Box>
                      <FormattedNumber
                        value={Number(reward.balanceUsd)}
                        variant="helperText"
                        compact
                        symbol="USD"
                        color="text.secondary"
                      />
                    </Box>
                  ))}
                </Box>
              </Row>
              <DetailsNumberLine description={<Trans>Total worth</Trans>} value={claimableUsd} />
            </>
          )}
          {selectedRewardSymbol !== 'all' && (
            <DetailsNumberLineWithSub
              symbol={<TokenIcon symbol={selectedReward.symbol} />}
              futureValue={selectedReward.balance}
              futureValueUSD={selectedReward.balanceUsd}
              description={<Trans>{selectedReward.symbol} Balance</Trans>}
            />
          )}
        </TxModalDetails>
      )}

      {txError && <GasEstimationError txError={txError} />}

      <ClaimRewardsActions
        isWrongNetwork={isWrongNetwork}
        selectedReward={selectedReward ?? ({} as Reward)}
        blocked={blockingError !== undefined}
      />
    </>
  );
};
