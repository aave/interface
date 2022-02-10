import { InterestRate, API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { useState } from 'react';
import { TxState } from 'src/helpers/types';
import {
  useAppDataContext,
  ComputedReserveData,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

export type BorrowModalContentProps = {
  underlyingAsset: string;
  handleClose: () => void;
};

export enum ErrorType {
  STABLE_RATE_NOT_ENABLED,
  NOT_ENOUGH_LIQUIDITY,
  NOT_ENOUGH_COLLATERAL,
  BORROWING_NOT_AVAILABLE,
}

export const BorrowModalContent = ({ underlyingAsset, handleClose }: BorrowModalContentProps) => {
  const { reserves, user, marketReferencePriceInUsd } = useAppDataContext();
  const { currentChainId } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();

  const [gasLimit, setGasLimit] = useState<string | undefined>(undefined);
  const [borrowTxState, setBorrowTxState] = useState<TxState>({ success: false });
  const [borrowUnWrapped, setBorrowUnWrapped] = useState(true);
  const [interestRateMode, setInterestRateMode] = useState<InterestRate>(InterestRate.Variable);
  const [amount, setAmount] = useState('');
  const [blockingError, setBlockingError] = useState<ErrorType | undefined>();
  const [amountToBorrow, setAmountToBorrow] = useState(amount);

  const networkConfig = getNetworkConfig(currentChainId);

  const poolReserve = reserves.find((reserve) => {
    if (underlyingAsset === API_ETH_MOCK_ADDRESS.toLowerCase()) {
      return reserve.symbol === networkConfig.wrappedBaseAssetSymbol;
    }
    return reserve.underlyingAsset === underlyingAsset;
  }) as ComputedReserveData;

  Object.entries(user.calculatedUserIncentives).forEach((incentive) => {
    const normalizedRewards = normalize(
      incentive[1].claimableRewards,
      incentive[1].rewardTokenDecimals
    );
    totalClaimableUSD =
      totalClaimableUSD + Number(normalizedRewards) * Number(incentive[1].rewardPriceFeed);
  });

  return <>hola</>;
};
