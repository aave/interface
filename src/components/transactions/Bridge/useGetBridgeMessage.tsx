import { BigNumber, constants, Contract, utils } from 'ethers';
import { formatEther, formatUnits, parseUnits } from 'ethers/lib/utils';
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
  feeToken,
  feeTokenOracle,
}: {
  sourceChainId: number;
  destinationChainId: number;
  amount: string;
  sourceTokenAddress: string;
  destinationAccount: string;
  feeToken: string;
  feeTokenOracle: string;
}) => {
  const [message, setMessage] = useState<MessageDetails>();
  const [bridgeFee, setBridgeFee] = useState('');
  const [bridgeFeeFormatted, setBridgeFeeFormatted] = useState('');
  const [latestAnswer, setLatestAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

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
          feeToken: feeToken,
          extraArgs: encodedExtraArgs,
        };

        const destinationChainSelector = getChainSelectorFor(destinationChainId);
        const fees: BigNumber = await sourceRouter.getFee(destinationChainSelector, message);

        const amountBN = utils.parseUnits(amount, 18);
        const updatedAmount = amountBN.sub(fees);

        // If the fee token is not the native token, we need to update the tokenAmounts to subtract fees
        if (feeToken !== constants.AddressZero) {
          message.tokenAmounts = [
            {
              token: sourceTokenAddress,
              amount: updatedAmount.toString(),
            },
          ];
        }

        const sourceLaneConfig = laneConfig.find(
          (config) => config.sourceChainId === sourceChainId
        );

        if (!sourceLaneConfig) {
          setLoading(false);
          throw Error(`No lane config found for chain ${sourceChainId}`);
        }
        let transactionCostUsd;

        if (feeToken === constants.AddressZero) {
          console.log('fee token ETH');
          // Handling for Ether (native token)
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

          const ethUsdPrice = formatUnits(latestPrice, decimals);
          transactionCostUsd = Number(formatUnits(fees, 18)) * Number(ethUsdPrice);
        } else {
          // Handling for GHO or other tokens
          const sourceLaneConfig = laneConfig.find(
            (config) => config.sourceChainId === sourceChainId
          );
          if (!sourceLaneConfig) {
            setLoading(false);
            throw Error(`No lane config found for chain ${sourceChainId}`);
          }

          const sourceTokenOracle = new Contract(feeTokenOracle, oracleAbi, provider);

          const [latestPrice, decimals]: [BigNumber, number] = await Promise.all([
            sourceTokenOracle.latestAnswer(),
            sourceTokenOracle.decimals(),
          ]);

          const tokenUsdPrice = formatUnits(latestPrice, decimals);
          transactionCostUsd = Number(formatUnits(fees, 18)) * Number(tokenUsdPrice);
        }

        setLatestAnswer(transactionCostUsd.toString());
        setMessage(message);
        setBridgeFeeFormatted(formatEther(fees));
        setBridgeFee(fees.toString());
      } catch (e) {
        setError(e.message);
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, [amount, destinationChainId, sourceChainId, sourceTokenAddress, destinationAccount, feeToken]);

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
  }, [amount, debounced, sourceTokenAddress, feeToken]);

  return {
    message,
    bridgeFee,
    bridgeFeeFormatted,
    loading,
    latestAnswer,
    error,
  };
};
