import { BigNumber, constants, Contract, utils } from 'ethers';
import { formatEther, parseUnits } from 'ethers/lib/utils';
import debounce from 'lodash/debounce';
import { useEffect, useMemo, useState } from 'react';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

import { MessageDetails, TokenAmount } from './BridgeActions';
import { getChainSelectorFor, getRouterFor, laneConfig } from './BridgeConfig';
import oracleAbi from './Oracle-abi.json';
import routerAbi from './Router-abi.json';

export const useGetBridgeMessage = ({
  sourceChainId,
  destinationChainId,
  amount,
  sourceTokenAddress,
  destinationAccount,
}: {
  sourceChainId: number;
  destinationChainId: number;
  amount: string;
  sourceTokenAddress: string;
  destinationAccount: string;
}) => {
  const [message, setMessage] = useState<MessageDetails>();
  const [bridgeFee, setBridgeFee] = useState('');
  const [bridgeFeeFormatted, setBridgeFeeFormatted] = useState('');
  const [latestAnswer, setLatestAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const debounced = useMemo(() => {
    return debounce(async () => {
      const provider = getProvider(sourceChainId);
      const sourceRouterAddress = getRouterFor(sourceChainId);
      const sourceRouter = new Contract(sourceRouterAddress, routerAbi, provider);

      try {
        const tokenAmounts: TokenAmount[] = [
          {
            token: sourceTokenAddress,
            amount: parseUnits(amount, 18).toString() || '0',
          },
        ];

        const functionSelector = utils.id('CCIP EVMExtraArgsV1').slice(0, 10);

        // "extraArgs" is a structure that can be represented as ['uint256']
        // extraArgs are { gasLimit: 0 }
        // we set gasLimit specifically to 0 because we are not sending any data so we are not expecting a receiving contract to handle data
        const extraArgs = utils.defaultAbiCoder.encode(['uint256'], [0]);
        const encodedExtraArgs = functionSelector + extraArgs.slice(2);

        const message: MessageDetails = {
          receiver: utils.defaultAbiCoder.encode(['address'], [destinationAccount]),
          data: '0x', // no data
          tokenAmounts: tokenAmounts,
          feeToken: constants.AddressZero, // Zero address means use the native token as fee
          extraArgs: encodedExtraArgs,
        };

        const destinationChainSelector = getChainSelectorFor(destinationChainId);
        let fees;
        try {
          console.log('message', message);
          fees = await sourceRouter.getFee(destinationChainSelector, message);
        } catch (err) {
          console.log('FOO BUSTED FEE', err);
        }

        const sourceLaneConfig = laneConfig.find(
          (config) => config.sourceChainId === sourceChainId
        );

        if (!sourceLaneConfig) {
          setLoading(false);
          throw Error(`No lane config found for chain ${sourceChainId}`);
        }

        const sourceAssetOracle = new Contract(
          sourceLaneConfig.wrappedNativeOracle,
          oracleAbi,
          provider
        );

        const [latestPrice, decimals]: [BigNumber, number] = await Promise.all([
          sourceAssetOracle.latestAnswer(),
          sourceAssetOracle.decimals(),
        ]);

        const ethUsdPrice = latestPrice.div(BigNumber.from(10).pow(decimals));
        const transactionCostUsd = fees.mul(ethUsdPrice).div(BigNumber.from(10).pow(18));

        setLatestAnswer(transactionCostUsd.toString());
        setMessage(message);
        setBridgeFeeFormatted(formatEther(fees));
        setBridgeFee(fees.toString());
      } catch (e) {
        console.log('do we error here', e);
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, [amount, destinationChainId, sourceChainId, sourceTokenAddress, destinationAccount]);

  useEffect(() => {
    if (amount && sourceTokenAddress) {
      setLoading(true);
      debounced();
    } else {
      setLoading(false);
      setMessage(undefined);
      setBridgeFee('');
      setBridgeFeeFormatted('');
    }

    return () => {
      debounced.cancel();
    };
  }, [amount, debounced, sourceTokenAddress]);

  return {
    message,
    bridgeFee,
    bridgeFeeFormatted,
    loading,
    latestAnswer,
  };
};
